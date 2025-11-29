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
  console.log('✅ ABI loaded successfully for login handler');
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
    return null;
  }
}

// Login Handler
async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    console.log('Processing login for email:', email);

    // Encrypt the credentials
    const emailEncrypted = encrypt(email);
    const passwordEncrypted = encrypt(password);

    console.log('Credentials encrypted, fetching users from blockchain...');

    // Get all users from blockchain
    const users = await contract.getUsers();
    console.log(`Total users in blockchain: ${users.length}`);

    // Find matching user
    let matchedUser = null;
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      try {
        // Decrypt stored email
        const decryptedEmail = decrypt(user.email);
        
        // Check if email matches
        if (decryptedEmail && decryptedEmail.toLowerCase() === email.toLowerCase()) {
          console.log('Email match found for user ID:', user.id.toString());
          
          // Decrypt stored password
          const decryptedPassword = decrypt(user.passwordHash);
          
          // Check if password matches
          if (decryptedPassword && decryptedPassword === password) {
            // Decrypt username
            const decryptedUsername = decrypt(user.username);
            
            matchedUser = {
              id: user.id.toString(),
              username: decryptedUsername,
              email: decryptedEmail,
              role: user.role
            };
            
            console.log('✅ Login successful for user:', decryptedUsername);
            break;
          } else {
            console.log('❌ Password mismatch for this user');
          }
        }
      } catch (decryptError) {
        console.error('Error decrypting user data:', decryptError.message);
        continue;
      }
    }

    if (matchedUser) {
      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: matchedUser
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

  } catch (error) {
    console.error('LOGIN ERROR:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Get User Profile Handler (after login)
async function handleGetProfile(req, res) {
  try {
    const { user_id } = req.params;

    const userId = parseInt(user_id);
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user_id"
      });
    }

    console.log('Fetching profile for user ID:', userId);

    // Get all users
    const users = await contract.getUsers();

    // Find the user
    const user = users.find(u => u.id.toString() === userId.toString());

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Decrypt user data
    const decryptedUsername = decrypt(user.username);
    const decryptedEmail = decrypt(user.email);

    return res.status(200).json({
      success: true,
      user: {
        id: user.id.toString(),
        username: decryptedUsername,
        email: decryptedEmail,
        role: user.role
      }
    });

  } catch (error) {
    console.error('GET PROFILE ERROR:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Verify User Session (for protected routes)
async function verifySession(req, res) {
  try {
    const { user_id, email } = req.body;

    if (!user_id || !email) {
      return res.status(400).json({
        success: false,
        message: "user_id and email are required"
      });
    }

    const userId = parseInt(user_id);
    const users = await contract.getUsers();
    
    const user = users.find(u => u.id.toString() === userId.toString());

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Session invalid"
      });
    }

    const decryptedEmail = decrypt(user.email);

    if (decryptedEmail.toLowerCase() === email.toLowerCase()) {
      return res.status(200).json({
        success: true,
        message: "Session valid"
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Session invalid"
      });
    }

  } catch (error) {
    console.error('VERIFY SESSION ERROR:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

// Export as Express router
const router = express.Router();

// Routes
router.post('/login', handleLogin);                   // Login
router.get('/profile/:user_id', handleGetProfile);    // Get user profile
router.post('/verify-session', verifySession);        // Verify user session

module.exports = router;