const { ethers } = require('ethers');
const express = require('express');
const fs = require('fs');
const path = require('path');

// Blockchain configuration
const RPC_URL = "http://127.0.0.1:8545";
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // UPDATE THIS!

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
  console.log('✅ ABI loaded successfully for products handler');
} catch (error) {
  console.error('❌ Failed to load ABI:', error.message);
  process.exit(1);
}

const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

// Add Product Handler (Admin only) - NO ENCRYPTION
async function handleAddProduct(req, res) {
  try {
    const { name, description, price, stock, category, image } = req.body;

    if (!name || !description || !price || !stock) {
      return res.status(400).json({
        success: false,
        message: "name, description, price, and stock are required"
      });
    }

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock);

    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "price must be a valid positive number"
      });
    }

    if (isNaN(stockNum) || stockNum < 0) {
      return res.status(400).json({
        success: false,
        message: "stock must be a valid non-negative number"
      });
    }

    console.log('Adding new product:', name);

    // Send transaction to blockchain WITHOUT encryption
    console.log('Sending product transaction to blockchain...');
    
    const tx = await contract.addProduct(
      name,
      description,
      price.toString(),
      stock.toString(),
      category || 'General',
      image || '📦',
      {
        gasLimit: 500000
      }
    );
    
    console.log('Transaction sent. Hash:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);

    return res.status(200).json({
      success: true,
      message: "Product added successfully to blockchain",
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    });

  } catch (error) {
    console.error('ADD PRODUCT ERROR:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Get All Products Handler - NO DECRYPTION NEEDED
async function handleGetAllProducts(req, res) {
  try {
    console.log('Fetching all products from blockchain...');

    const products = await contract.getProducts();
    console.log(`Found ${products.length} total products`);

    const formattedProducts = products.map(product => ({
      id: product.id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      image: product.image
    }));

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      count: formattedProducts.length,
      products: formattedProducts
    });

  } catch (error) {
    console.error('GET ALL PRODUCTS ERROR:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Get Single Product Handler
async function handleGetProduct(req, res) {
  try {
    const { product_id } = req.params;

    const productId = parseInt(product_id);
    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "product_id must be a valid positive number"
      });
    }

    console.log('Fetching product ID:', productId);

    const product = await contract.getProductById(productId);

    const formattedProduct = {
      id: product.id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      image: product.image
    };

    return res.status(200).json({
      success: true,
      product: formattedProduct
    });

  } catch (error) {
    console.error('GET PRODUCT ERROR:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Update Product Handler
async function handleUpdateProduct(req, res) {
  try {
    const { product_id } = req.params;
    const { price, stock } = req.body;

    const productId = parseInt(product_id);
    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "product_id must be a valid positive number"
      });
    }

    console.log('Updating product ID:', productId);

    if (price) {
      const tx = await contract.updateProductPrice(productId, price.toString(), { gasLimit: 300000 });
      await tx.wait();
      console.log('Price updated');
    }

    if (stock) {
      const tx = await contract.updateProductStock(productId, stock.toString(), { gasLimit: 300000 });
      await tx.wait();
      console.log('Stock updated');
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully"
    });

  } catch (error) {
    console.error('UPDATE PRODUCT ERROR:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Delete Product Handler
async function handleDeleteProduct(req, res) {
  try {
    const { product_id } = req.params;

    const productId = parseInt(product_id);
    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "product_id must be a valid positive number"
      });
    }

    console.log('Deleting product ID:', productId);

    const tx = await contract.deleteProduct(productId, { gasLimit: 300000 });
    const receipt = await tx.wait();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    });

  } catch (error) {
    console.error('DELETE PRODUCT ERROR:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Search Products Handler
async function handleSearchProducts(req, res) {
  try {
    const { query, category } = req.query;

    console.log('Searching products with query:', query, 'category:', category);

    const products = await contract.getProducts();

    let filteredProducts = products.map(product => ({
      id: product.id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      image: product.image
    }));

    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
      );
    }

    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(p => 
        p.category.toLowerCase() === category.toLowerCase()
      );
    }

    return res.status(200).json({
      success: true,
      count: filteredProducts.length,
      products: filteredProducts
    });

  } catch (error) {
    console.error('SEARCH PRODUCTS ERROR:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Export as Express router
const router = express.Router();

// Routes - IMPORTANT ORDER!
router.get('/products/search', handleSearchProducts);
router.post('/products', handleAddProduct);
router.get('/products', handleGetAllProducts);
router.get('/products/:product_id', handleGetProduct);
router.put('/products/:product_id', handleUpdateProduct);
router.delete('/products/:product_id', handleDeleteProduct);

module.exports = router;