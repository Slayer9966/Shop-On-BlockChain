const { ethers } = require('ethers');
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Blockchain configuration - HARDCODED
const RPC_URL = "http://127.0.0.1:8545";
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // UPDATE THIS!

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
  console.log('✅ ABI loaded successfully for cart handler');
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
    return encryptedText; // Return as-is if decryption fails
  }
}

// Add to Cart Handler
async function handleAddToCart(req, res) {
  try {
    const { user_id, product_id, quantity } = req.body;

    // Validate required fields
    if (!user_id || !product_id || !quantity) {
      return res.status(400).json({
        success: false,
        message: "user_id, product_id, and quantity are required"
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

    // Validate quantity
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "quantity must be a valid positive number"
      });
    }

    console.log('Adding to cart for user ID:', userId);
    console.log('Product ID:', product_id, 'Quantity:', quantity);

    // Encrypt cart item data
    const encryptedProductId = encrypt(product_id.toString());
    const encryptedQuantity = encrypt(quantity.toString());

    console.log('Cart item data encrypted');

    // Send transaction to blockchain
    console.log('Sending cart transaction to blockchain...');
    
    try {
      const gasEstimate = await contract.addToCart.estimateGas(
        userId,
        encryptedProductId,
        encryptedQuantity
      );
      console.log('Gas estimate:', gasEstimate.toString());
    } catch (gasError) {
      console.error('❌ Gas estimation failed:', gasError.message);
      throw new Error('Contract call would fail: ' + gasError.message);
    }
    
    const tx = await contract.addToCart(
      userId,
      encryptedProductId,
      encryptedQuantity,
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
      message: "Item added to cart successfully",
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    });

  } catch (error) {
    console.error('ADD TO CART ERROR:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Get User Cart Handler
async function handleGetUserCart(req, res) {
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

    console.log('Fetching cart for user ID:', userId);

    // Get cart items from blockchain
    const cartItems = await contract.getUserCart(userId);

    console.log(`Found ${cartItems.length} items in cart for user ${userId}`);

    // Decrypt and format cart items
    const decryptedCart = cartItems.map(item => {
      try {
        return {
          id: item.id.toString(),
          user_id: item.user_id.toString(),
          product_id: decrypt(item.product_id),
          quantity: decrypt(item.quantity)
        };
      } catch (error) {
        console.error('Error decrypting cart item:', error.message);
        // Return encrypted data if decryption fails
        return {
          id: item.id.toString(),
          user_id: item.user_id.toString(),
          product_id: item.product_id,
          quantity: item.quantity,
          encrypted: true
        };
      }
    });

    // Filter out items with quantity 0 (cleared items)
    const activeCart = decryptedCart.filter(item => item.quantity !== '0');

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      count: activeCart.length,
      cart: activeCart
    });

  } catch (error) {
    console.error('GET USER CART ERROR:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Get All Cart Items Handler (Admin function)
async function handleGetAllCarts(req, res) {
  try {
    console.log('Fetching all cart items from blockchain...');

    // Get all cart items from blockchain
    const cartItems = await contract.getCart();

    console.log(`Found ${cartItems.length} total cart items`);

    // Decrypt and format cart items
    const decryptedCart = cartItems.map(item => {
      try {
        return {
          id: item.id.toString(),
          user_id: item.user_id.toString(),
          product_id: decrypt(item.product_id),
          quantity: decrypt(item.quantity)
        };
      } catch (error) {
        console.error('Error decrypting cart item:', error.message);
        return {
          id: item.id.toString(),
          user_id: item.user_id.toString(),
          product_id: item.product_id,
          quantity: item.quantity,
          encrypted: true
        };
      }
    });

    // Filter out items with quantity 0 (cleared items)
    const activeCart = decryptedCart.filter(item => item.quantity !== '0');

    return res.status(200).json({
      success: true,
      message: "All cart items fetched successfully",
      count: activeCart.length,
      cart: activeCart
    });

  } catch (error) {
    console.error('GET ALL CARTS ERROR:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Clear User Cart Handler
async function handleClearUserCart(req, res) {
  try {
    const { user_id } = req.params;

    const userId = parseInt(user_id);
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "user_id must be a valid positive number"
      });
    }

    console.log('Clearing cart for user ID:', userId);

    // Send transaction to blockchain
    const tx = await contract.clearUserCart(userId, { gasLimit: 500000 });
    const receipt = await tx.wait();

    console.log('Cart cleared. Transaction:', tx.hash);

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    });

  } catch (error) {
    console.error('CLEAR CART ERROR:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Get Cart Summary (with totals)
async function handleGetCartSummary(req, res) {
  try {
    const { user_id } = req.params;

    const userId = parseInt(user_id);
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "user_id must be a valid positive number"
      });
    }

    console.log('Fetching cart summary for user ID:', userId);

    const cartItems = await contract.getUserCart(userId);

    // Decrypt and calculate totals
    let totalItems = 0;
    const decryptedCart = cartItems.map(item => {
      const quantity = parseInt(decrypt(item.quantity));
      if (quantity > 0) { // Only count active items
        totalItems += quantity;
      }
      
      return {
        id: item.id.toString(),
        user_id: item.user_id.toString(),
        product_id: decrypt(item.product_id),
        quantity: quantity
      };
    });

    // Filter out cleared items
    const activeCart = decryptedCart.filter(item => item.quantity > 0);

    return res.status(200).json({
      success: true,
      message: "Cart summary fetched successfully",
      summary: {
        total_items: totalItems,
        unique_products: activeCart.length,
        cart_items: activeCart
      }
    });

  } catch (error) {
    console.error('GET CART SUMMARY ERROR:', error);
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
router.post('/cart', handleAddToCart);                       // Add item to cart
router.get('/cart/user/:user_id', handleGetUserCart);        // Get cart for specific user
router.get('/cart/summary/:user_id', handleGetCartSummary);  // Get cart summary with totals
router.get('/cart', handleGetAllCarts);                      // Get all carts (admin)
router.post('/cart/clear/:user_id', handleClearUserCart);    // Clear user cart

module.exports = router;