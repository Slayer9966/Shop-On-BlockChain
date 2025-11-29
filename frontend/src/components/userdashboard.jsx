import { useState, useEffect } from 'react';
import { ShoppingCart, Package, Trash2, Plus, Minus, LogOut, User, Search, Filter, Receipt, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

export default function UserDashboard() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [user, setUser] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchCart(parsedUser.id);
      fetchOrders(parsedUser.id);
    } else {
      setUser({ id: 1, username: 'Demo User', email: 'demo@electron.com' });
      fetchCart(1);
      fetchOrders(1);
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      } else {
        console.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Mock data fallback
      setProducts([
        {
          id: '1',
          name: 'Wireless Headphones',
          description: 'Premium noise-cancelling wireless headphones with 30hr battery',
          price: '299.99',
          stock: '50',
          category: 'Electronics',
          image: '🎧'
        },
        {
          id: '2',
          name: 'Smart Watch',
          description: 'Fitness tracker with heart rate monitor and GPS',
          price: '199.99',
          stock: '100',
          category: 'Electronics',
          image: '⌚'
        },
        {
          id: '3',
          name: 'Laptop Stand',
          description: 'Ergonomic aluminum laptop stand with adjustable height',
          price: '49.99',
          stock: '200',
          category: 'Accessories',
          image: '💻'
        },
        {
          id: '4',
          name: 'Mechanical Keyboard',
          description: 'RGB backlit gaming keyboard with Cherry MX switches',
          price: '149.99',
          stock: '75',
          category: 'Electronics',
          image: '⌨️'
        }
      ]);
    }
    setLoading(false);
  };

  const fetchCart = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/user/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setCart(data.cart || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart([]);
    }
  };

  const fetchOrders = async (userId) => {
    setOrdersLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
    setOrdersLoading(false);
  };

  const addToCart = async (product) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          product_id: product.id,
          quantity: '1'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Item added to cart successfully!\n\nTransaction Hash: ' + data.transactionHash);
        fetchCart(user.id);
      } else {
        alert('❌ Failed to add item to cart: ' + data.message);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('❌ Error adding to cart. Please check console.');
    }
  };

  const removeFromCart = async (cartItemId) => {
    // You'll need to implement a remove cart item endpoint
    setCart(cart.filter(item => item.id !== cartItemId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    try {
      const total = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.product_id);
        return sum + (product ? parseFloat(product.price) * parseInt(item.quantity) : 0);
      }, 0);

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          order_total: total.toFixed(2),
          status: 'pending',
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Order placed successfully!\n\nTransaction Hash: ${data.transactionHash}\nTotal: $${total.toFixed(2)}\nItems: ${cart.length}`);
        
        // Clear cart - you may need to implement this endpoint
        setCart([]);
        setShowCart(false);
        fetchOrders(user.id);
      } else {
        alert('❌ Failed to place order: ' + data.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('❌ Error during checkout. Please try again.');
    }
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.product_id);
      return sum + (product ? parseFloat(product.price) * parseInt(item.quantity) : 0);
    }, 0).toFixed(2);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + parseInt(item.quantity || 1), 0);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'shipped':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(products.map(p => p.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">Electron Shop</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-gray-300">
                <User className="w-5 h-5" />
                <span>{user?.username || 'Guest'}</span>
              </div>

              <button
                onClick={() => {
                  setShowOrders(!showOrders);
                  setShowCart(false);
                }}
                className="relative p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                title="My Orders"
              >
                <Receipt className="w-6 h-6" />
                {orders.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                    {orders.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => {
                  setShowCart(!showCart);
                  setShowOrders(false);
                }}
                className="relative p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-300"
                title="Logout"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden hover:border-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
              >
                <div className="p-6">
                  <div className="text-6xl text-center mb-4">{product.image}</div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 h-12 overflow-hidden">{product.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-purple-400">${product.price}</span>
                    <span className="text-sm text-gray-400">Stock: {product.stock}</span>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No products found</p>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowCart(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-800 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6" />
                    Your Cart
                  </h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-purple-100 mt-2">{getTotalItems()} items</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map((item) => {
                    const product = products.find(p => p.id === item.product_id);
                    if (!product) return null;
                    
                    return (
                      <div
                        key={item.id}
                        className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:border-purple-500 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold mb-1">{product.name}</h3>
                            <p className="text-purple-400 font-bold">${product.price}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/20 rounded transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Qty: {item.quantity}</span>
                          <span className="text-white font-bold">
                            ${(parseFloat(product.price) * parseInt(item.quantity)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-gray-700 p-6 bg-gray-900">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400 text-lg">Total:</span>
                    <span className="text-3xl font-bold text-white">${getCartTotal()}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105"
                  >
                    Checkout Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Orders Sidebar */}
      {showOrders && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowOrders(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-2xl bg-gray-800 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="bg-gradient-to-r from-blue-600 to-purple-500 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Receipt className="w-6 h-6" />
                    My Orders
                  </h2>
                  <button
                    onClick={() => setShowOrders(false)}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-blue-100 mt-2">{orders.length} total orders</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {ordersLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16">
                    <Receipt className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No orders yet</p>
                    <p className="text-gray-500 text-sm mt-2">Start shopping to create your first order!</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-gray-700/50 border border-gray-600 rounded-lg p-6 hover:border-blue-500 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-white font-bold text-lg">Order #{order.id}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                              {order.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(order.timestamp)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">${order.order_total}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-gray-600">
                        {order.status.toLowerCase() === 'delivered' && (
                          <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm font-semibold">Delivered</span>
                          </div>
                        )}
                        {order.status.toLowerCase() === 'shipped' && (
                          <div className="flex items-center gap-2 text-blue-400">
                            <Truck className="w-5 h-5" />
                            <span className="text-sm font-semibold">On the way</span>
                          </div>
                        )}
                        {order.status.toLowerCase() === 'pending' && (
                          <div className="flex items-center gap-2 text-yellow-400">
                            <Clock className="w-5 h-5" />
                            <span className="text-sm font-semibold">Processing</span>
                          </div>
                        )}
                        {order.status.toLowerCase() === 'cancelled' && (
                          <div className="flex items-center gap-2 text-red-400">
                            <XCircle className="w-5 h-5" />
                            <span className="text-sm font-semibold">Cancelled</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {orders.length > 0 && (
                <div className="border-t border-gray-700 p-6 bg-gray-900">
                  <div className="text-center text-gray-400 text-sm">
                    🔐 All orders are stored securely on the blockchain
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}