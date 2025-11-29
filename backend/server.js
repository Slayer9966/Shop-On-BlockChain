const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import route handlers from services folder
const productsRouter = require('./services/products');
const cartRouter = require('./services/cart');
const ordersRouter = require('./services/orders');
const usersRouter = require('./services/users');

// ✅ Import login and signup handlers
const loginRouter = require('./services/login');
const signupRouter = require('./services/signup'); // Add this line

console.log('✅ Loading route handlers...');

// API Routes
app.use('/api', productsRouter);
app.use('/api', cartRouter);
app.use('/api', ordersRouter);
app.use('/api', usersRouter);
app.use('/api', loginRouter);
app.use('/api', signupRouter); // Add this line

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Electron Shop API is running',
    timestamp: new Date().toISOString()
  });
});

// ✅ ADD TEMPORARY TEST ENDPOINTS (for testing)
app.post('/api/login-test', (req, res) => {
  console.log('🔐 Login test endpoint hit');
  console.log('Received data:', req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }
  
  // Mock response for testing
  return res.json({
    success: true,
    message: "Test login successful!",
    user: {
      id: "1",
      username: "testuser",
      email: email,
      role: "user"
    }
  });
});

app.post('/api/signup-test', (req, res) => {
  console.log('📝 Signup test endpoint hit');
  console.log('Received data:', req.body);
  
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }
  
  // Mock response for testing
  return res.json({
    success: true,
    message: "Test signup successful!",
    user: {
      id: "1",
      username: name,
      email: email,
      role: "user"
    },
    transactionHash: "0x1234567890abcdef",
    blockNumber: 12345
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Electron Shop API',
    version: '1.0.0',
    endpoints: {
      products: {
        'GET /api/products': 'Get all products',
        'POST /api/products': 'Add new product (admin)',
        'GET /api/products/:id': 'Get single product',
        'PUT /api/products/:id': 'Update product (admin)',
        'DELETE /api/products/:id': 'Delete product (admin)',
        'GET /api/products/search': 'Search products'
      },
      auth: {
        'POST /api/login': 'User login',
        'POST /api/signup': 'User registration',
        'POST /api/login-test': 'Test login endpoint',
        'POST /api/signup-test': 'Test signup endpoint',
        'GET /api/profile/:user_id': 'Get user profile',
        'POST /api/verify-session': 'Verify user session'
      },
      cart: {
        'GET /api/cart': 'Get all cart items (admin)',
        'POST /api/cart': 'Add item to cart',
        'GET /api/cart/user/:user_id': 'Get user cart',
        'GET /api/cart/summary/:user_id': 'Get cart summary'
      },
      orders: {
        'GET /api/orders': 'Get all orders (admin)',
        'POST /api/orders': 'Create new order',
        'GET /api/orders/user/:user_id': 'Get user orders',
        'PUT /api/orders/:order_id/status': 'Update order status (admin)'
      },
      users: {
        'GET /api/users': 'Get all users (admin)',
        'POST /api/users/register': 'Register new user',
        'POST /api/users/login': 'Login user',
        'GET /api/users/:username': 'Get user by username'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('ERROR:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║                                                    ║');
  console.log('║         🚀 Electron Shop API Server 🚀            ║');
  console.log('║                                                    ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('📋 Available Endpoints:');
  console.log('   Products:  /api/products');
  console.log('   Auth:      /api/login, /api/signup');
  console.log('   Cart:      /api/cart');
  console.log('   Orders:    /api/orders');
  console.log('   Users:     /api/users');
  console.log('');
  console.log('🧪 Test Endpoints:');
  console.log('   /api/login-test, /api/signup-test');
  console.log('');
  console.log('🔗 Blockchain: Connected to local Hardhat node');
  console.log('⛓️  Network:    http://127.0.0.1:8545');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('════════════════════════════════════════════════════');
});