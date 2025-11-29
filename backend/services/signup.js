const { ethers } = require('ethers');
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Blockchain configuration - HARDCODED
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
  
  // The ABI might be directly in the file or in an 'abi' property
  contractABI = abiData.abi || abiData;
  
  console.log('✅ ABI loaded successfully from:', abiPath);
} catch (error) {
  console.error('❌ Failed to load ABI from:', abiPath);
  console.error('Error:', error.message);
  process.exit(1);
}

// Debug: Log connection info on startup
(async () => {
  try {
    const network = await provider.getNetwork();
    const balance = await provider.getBalance(wallet.address);
    const code = await provider.getCode(CONTRACT_ADDRESS);
    
    console.log('\n=== BLOCKCHAIN CONNECTION INFO ===');
    console.log('Network Chain ID:', network.chainId);
    console.log('Wallet Address:', wallet.address);
    console.log('Wallet Balance:', ethers.formatEther(balance), 'ETH');
    console.log('Contract Address:', CONTRACT_ADDRESS);
    console.log('Contract Code Exists:', code !== '0x');
    console.log('ABI Functions:', contractABI.filter(item => item.type === 'function').map(f => f.name).join(', '));
    console.log('==================================\n');
    
    if (code === '0x') {
      console.error('⚠️  WARNING: No contract code found at this address!');
      console.error('Make sure the contract is deployed at:', CONTRACT_ADDRESS);
    }
  } catch (error) {
    console.error('❌ Failed to connect to blockchain:', error.message);
  }
})();

const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

// Test function to verify contract connectivity
(async () => {
  try {
    console.log('🔍 Testing contract methods...');
    
    // Test: Call getUsers
    const users = await contract.getUsers();
    console.log('✅ getUsers() works! Current users:', users.length);
    console.log(''); // Empty line for readability
    
  } catch (error) {
    console.error('❌ Contract test failed:', error.message);
    console.error('This means the contract at this address is not your Electron contract!');
    console.error('Please redeploy and update CONTRACT_ADDRESS.\n');
  }
})();

// Encryption function (AES-256-CBC)
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return IV + encrypted data (IV is needed for decryption)
  return iv.toString('hex') + ':' + encrypted;
}

// Decryption function (AES-256-CBC)
function decrypt(encryptedText) {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Main signup handler
async function handleSignup(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    console.log('Processing signup for:', name, email);

    // Encrypt the credentials using AES-256-CBC
    const nameEncrypted = encrypt(name);
    const emailEncrypted = encrypt(email);
    const passwordEncrypted = encrypt(password);

    console.log('Encrypted data generated:');
    console.log('Name encrypted:', nameEncrypted.substring(0, 50) + '...');
    console.log('Email encrypted:', emailEncrypted.substring(0, 50) + '...');
    console.log('Password encrypted:', passwordEncrypted.substring(0, 50) + '...');

    // Send transaction to blockchain
    console.log('Sending transaction to blockchain...');
    
    // Try to estimate gas first to catch errors early
    try {
      const gasEstimate = await contract.addUser.estimateGas(
        nameEncrypted, 
        emailEncrypted, 
        passwordEncrypted,
        "user" // default role
      );
      console.log('Gas estimate:', gasEstimate.toString());
    } catch (gasError) {
      console.error('❌ Gas estimation failed:', gasError.message);
      console.error('This usually means the contract call would revert.');
      throw new Error('Contract call would fail: ' + gasError.message);
    }
    
    const tx = await contract.addUser(
      nameEncrypted, 
      emailEncrypted, 
      passwordEncrypted,
      "user", // default role
      {
        gasLimit: 500000
      }
    );
    
    console.log('Transaction sent. Hash:', tx.hash);
    console.log('Waiting for confirmation...');
    
    const receipt = await tx.wait();
    
    console.log('Transaction confirmed in block:', receipt.blockNumber);

    return res.status(200).json({
      success: true,
      message: "User registered successfully on blockchain",
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    });

  } catch (error) {
    console.error('SIGNUP ERROR:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Test decryption (for verification)
function testEncryptionDecryption() {
  const testData = "test@example.com";
  const encrypted = encrypt(testData);
  const decrypted = decrypt(encrypted);
  
  console.log('=== ENCRYPTION TEST ===');
  console.log('Original:', testData);
  console.log('Encrypted:', encrypted);
  console.log('Decrypted:', decrypted);
  console.log('Match:', testData === decrypted);
  console.log('=======================\n');
}

// Run test on startup
testEncryptionDecryption();

// Export as Express router
const router = express.Router();
router.post('/signup', handleSignup);

// Export utility functions for use in other modules
module.exports = router;
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;