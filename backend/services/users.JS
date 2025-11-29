const { ethers } = require('ethers');
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Blockchain configuration
const RPC_URL = "http://127.0.0.1:8545";
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Encryption configuration
const ENCRYPTION_KEY = crypto.scryptSync('your-secret-passphrase', 'salt', 32);
const ALGORITHM = 'aes-256-cbc';

// Use ethers v6 syntax
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Load ABI from file
const abiPath = path.join(__dirname, '..', 'ABI', 'Electron.json');
let contractABI;

try {
  const abiFile = fs.readFileSync(abiPath, 'utf8');
  const abiData = JSON.parse(abiFile);
  contractABI = abiData.abi || abiData;
  console.log('✅ ABI loaded successfully for users handler');
} catch (error) {
  console.error('❌ Failed to load ABI:', error.message);
  process.exit(1);
}

const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

// Encryption function (AES-256-CBC)
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

// Decryption function (AES-256-CBC)
function decrypt(encryptedText) {
  try {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    return encryptedText;
  }
}

// Get All Users Handler (Admin)
async function handleGetAllUsers(req, res) {
  try {
    console.log('Fetching all users from blockchain...');

    // Get all users from blockchain
    const users = await contract.getUsers();

    console.log(`Found ${users.length} total users`);

    // Decrypt and format users (but DON'T return passwords!)
    const decryptedUsers = users.map(user => {
      try {
        return {
          id: user.id.toString(),
          username: decrypt(user.username),
          email: decrypt(user.email),
          role: user.role
          // Note: We deliberately don't decrypt or return passwordHash for security
        };
      } catch (error) {
        console.error('Error decrypting user:', error.message);
        return {
          id: user.id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
          encrypted: true
        };
      }
    });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      count: decryptedUsers.length,
      users: decryptedUsers
    });

  } catch (error) {
    console.error('GET ALL USERS ERROR:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Get User by Username Handler
async function handleGetUserByUsername(req, res) {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "username is required"
      });
    }

    console.log('Fetching user:', username);

    // Encrypt username for searching
    const encryptedUsername = encrypt(username);

    // Get user from blockchain
    const user = await contract.getUserByUsername(encryptedUsername);

    // Decrypt user data (but DON'T return password!)
    const decryptedUser = {
      id: user.id.toString(),
      username: decrypt(user.username),
      email: decrypt(user.email),
      role: user.role
    };

    return res.status(200).json({
      success: true,
      user: decryptedUser
    });

  } catch (error) {
    console.error('GET USER BY USERNAME ERROR:', error);
    
    if (error.message.includes('User not found')) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Register User Handler
async function handleRegisterUser(req, res) {
  try {
    const { username, email, password, role } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "username, email, and password are required"
      });
    }

    console.log('Registering new user:', username);

    // Hash the password (simple hash - in production use bcrypt!)
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    // Encrypt user data
    const encryptedUsername = encrypt(username);
    const encryptedEmail = encrypt(email);
    const encryptedPasswordHash = encrypt(passwordHash);
    const userRole = role || 'user';

    console.log('User data encrypted');

    // Send transaction to blockchain
    console.log('Sending user registration transaction to blockchain...');
    
    try {
      const gasEstimate = await contract.addUser.estimateGas(
        encryptedUsername,
        encryptedEmail,
        encryptedPasswordHash,
        userRole
      );
      console.log('Gas estimate:', gasEstimate.toString());
    } catch (gasError) {
      console.error('❌ Gas estimation failed:', gasError.message);
      
      // Check if it's a duplicate email error
      if (gasError.message.includes('Email already registered')) {
        return res.status(400).json({
          success: false,
          message: "Email already registered"
        });
      }
      
      throw new Error('Contract call would fail: ' + gasError.message);
    }
    
    const tx = await contract.addUser(
      encryptedUsername,
      encryptedEmail,
      encryptedPasswordHash,
      userRole,
      {
        gasLimit: 2000000  // Increased gas limit for user registration
      }
    );
    
    console.log('Transaction sent. Hash:', tx.hash);
    console.log('Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);

    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    });

  } catch (error) {
    console.error('REGISTER USER ERROR:', error);
    
    if (error.message.includes('Email already registered')) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Login User Handler
async function handleLoginUser(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "username and password are required"
      });
    }

    console.log('Login attempt for user:', username);

    // Hash the password
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    // Encrypt credentials for checking
    const encryptedUsername = encrypt(username);
    const encryptedPasswordHash = encrypt(passwordHash);

    // Check user credentials on blockchain
    const isValid = await contract.checkUser(encryptedUsername, encryptedPasswordHash);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    // Get full user details
    const user = await contract.getUserByUsername(encryptedUsername);

    // Decrypt user data
    const decryptedUser = {
      id: user.id.toString(),
      username: decrypt(user.username),
      email: decrypt(user.email),
      role: user.role
    };

    console.log('Login successful for user:', username);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: decryptedUser
    });

  } catch (error) {
    console.error('LOGIN USER ERROR:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Export as Express router
const router = express.Router();

// Routes
router.post('/users/register', handleRegisterUser);             // Register new user
router.post('/users/login', handleLoginUser);                   // Login user
router.get('/users', handleGetAllUsers);                        // Get all users (admin)
router.get('/users/:username', handleGetUserByUsername);        // Get user by username

module.exports = router;