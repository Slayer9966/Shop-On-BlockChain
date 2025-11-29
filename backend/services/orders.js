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
  console.log('✅ ABI loaded successfully for orders handler');
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

// Add Order Handler
async function handleAddOrder(req, res) {
  try {
    const { user_id, order_total, status, timestamp } = req.body;

    // Validate required fields
    if (!user_id || !order_total || !status) {
      return res.status(400).json({
        success: false,
        message: "user_id, order_total, and status are required"
      });
    }

    // Validate user_id is a number
    const userId = parseInt(user_id);
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "user_id must be a valid positive number"
      });
    }

    console.log('Creating order for user ID:', userId);

    // Encrypt order data
    const encryptedOrderTotal = encrypt(order_total.toString());
    const encryptedStatus = encrypt(status);
    const encryptedTimestamp = encrypt(timestamp || new Date().toISOString());

    console.log('Order data encrypted');

    // Send transaction to blockchain
    console.log('Sending order transaction to blockchain...');
    
    try {
      const gasEstimate = await contract.addOrder.estimateGas(
        userId,
        encryptedOrderTotal,
        encryptedStatus,
        encryptedTimestamp
      );
      console.log('Gas estimate:', gasEstimate.toString());
    } catch (gasError) {
      console.error('❌ Gas estimation failed:', gasError.message);
      throw new Error('Contract call would fail: ' + gasError.message);
    }
    
    const tx = await contract.addOrder(
      userId,
      encryptedOrderTotal,
      encryptedStatus,
      encryptedTimestamp,
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
      message: "Order placed successfully",
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    });

  } catch (error) {
    console.error('ADD ORDER ERROR:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Get All Orders Handler (Admin)
async function handleGetAllOrders(req, res) {
  try {
    console.log('Fetching all orders from blockchain...');

    // Get all orders from blockchain
    const orders = await contract.getOrders();

    console.log(`Found ${orders.length} total orders`);

    // Decrypt and format orders
    const decryptedOrders = orders.map(order => {
      try {
        return {
          id: order.id.toString(),
          user_id: order.user_id.toString(),
          order_total: decrypt(order.order_total),
          status: decrypt(order.status),
          timestamp: decrypt(order.timestamp)
        };
      } catch (error) {
        console.error('Error decrypting order:', error.message);
        return {
          id: order.id.toString(),
          user_id: order.user_id.toString(),
          order_total: order.order_total,
          status: order.status,
          timestamp: order.timestamp,
          encrypted: true
        };
      }
    });

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      count: decryptedOrders.length,
      orders: decryptedOrders
    });

  } catch (error) {
    console.error('GET ALL ORDERS ERROR:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Get User Orders Handler
async function handleGetUserOrders(req, res) {
  try {
    const { user_id } = req.params;

    // Validate user_id
    const userId = parseInt(user_id);
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "user_id must be a valid positive number"
      });
    }

    console.log('Fetching orders for user ID:', userId);

    // Get orders from blockchain
    const orders = await contract.getUserOrders(userId);

    console.log(`Found ${orders.length} orders for user ${userId}`);

    // Decrypt and format orders
    const decryptedOrders = orders.map(order => {
      try {
        return {
          id: order.id.toString(),
          user_id: order.user_id.toString(),
          order_total: decrypt(order.order_total),
          status: decrypt(order.status),
          timestamp: decrypt(order.timestamp)
        };
      } catch (error) {
        console.error('Error decrypting order:', error.message);
        return {
          id: order.id.toString(),
          user_id: order.user_id.toString(),
          order_total: order.order_total,
          status: order.status,
          timestamp: order.timestamp,
          encrypted: true
        };
      }
    });

    return res.status(200).json({
      success: true,
      message: "User orders fetched successfully",
      count: decryptedOrders.length,
      orders: decryptedOrders
    });

  } catch (error) {
    console.error('GET USER ORDERS ERROR:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Update Order Status Handler (Admin)
async function handleUpdateOrderStatus(req, res) {
  try {
    const { order_id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required"
      });
    }

    const orderId = parseInt(order_id);
    if (isNaN(orderId) || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: "order_id must be a valid positive number"
      });
    }

    console.log('Updating order status for order ID:', orderId, 'to:', status);

    // Encrypt the new status
    const encryptedStatus = encrypt(status);

    // Send transaction to blockchain
    const tx = await contract.updateOrderStatus(orderId, encryptedStatus, { gasLimit: 500000 });
    const receipt = await tx.wait();

    console.log('Order status updated. Transaction:', tx.hash);

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    });

  } catch (error) {
    console.error('UPDATE ORDER STATUS ERROR:', error);
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
router.post('/orders', handleAddOrder);                          // Create new order
router.get('/orders', handleGetAllOrders);                       // Get all orders (admin)
router.get('/orders/user/:user_id', handleGetUserOrders);        // Get user orders
router.put('/orders/:order_id/status', handleUpdateOrderStatus); // Update order status (admin)

module.exports = router;