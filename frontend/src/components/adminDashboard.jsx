import { useState, useEffect } from 'react';
import { Package, Users, Receipt, LogOut, Plus, Edit, Trash2, Save, X, Search, Filter, BarChart, TrendingUp, ShoppingCart, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, orders, users
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Product Form State
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image: ''
  });

  // Order Status Update
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      setUser({ id: 1, username: 'Admin', email: 'admin@electron.com', role: 'admin' });
    }

    fetchProducts();
    fetchOrders();
    fetchUsers();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Mock data
      setProducts([
        {
          id: '1',
          name: 'Wireless Headphones',
          description: 'Premium noise-cancelling wireless headphones',
          price: '299.99',
          stock: '50',
          category: 'Electronics',
          image: '🎧'
        },
        {
          id: '2',
          name: 'Smart Watch',
          description: 'Fitness tracker with heart rate monitor',
          price: '199.99',
          stock: '100',
          category: 'Electronics',
          image: '⌚'
        }
      ]);
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Mock data
      setOrders([
        {
          id: '1',
          user_id: '1',
          order_total: '349.98',
          status: 'pending',
          timestamp: '2024-01-20T10:30:00Z'
        },
        {
          id: '2',
          user_id: '2',
          order_total: '199.99',
          status: 'shipped',
          timestamp: '2024-01-21T14:20:00Z'
        }
      ]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Mock data
      setUsers([
        {
          id: '1',
          username: 'john_doe',
          email: 'john@example.com',
          role: 'user'
        },
        {
          id: '2',
          username: 'jane_smith',
          email: 'jane@example.com',
          role: 'user'
        }
      ]);
    }
  };

  const handleAddProduct = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Product added successfully!\n\nTransaction Hash: ' + data.transactionHash);
        setShowProductForm(false);
        setProductForm({ name: '', description: '', price: '', stock: '', category: '', image: '' });
        fetchProducts();
      } else {
        alert('❌ Failed to add product: ' + data.message);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('❌ Error adding product. Please check console.');
    }
  };

  const handleUpdateProduct = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Product updated successfully!');
        setShowProductForm(false);
        setEditingProduct(null);
        setProductForm({ name: '', description: '', price: '', stock: '', category: '', image: '' });
        fetchProducts();
      } else {
        alert('❌ Failed to update product: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('❌ Error updating product. Please check console.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Product deleted successfully!');
        fetchProducts();
      } else {
        alert('❌ Failed to delete product: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('❌ Error deleting product. Please check console.');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Order status updated successfully!');
        setUpdatingOrderId(null);
        setNewStatus('');
        fetchOrders();
      } else {
        alert('❌ Failed to update order status: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('❌ Error updating order status. Please check console.');
    }
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      image: product.image
    });
    setShowProductForm(true);
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

  const getUserById = (userId) => {
    const foundUser = users.find(u => u.id === userId.toString());
    return foundUser ? foundUser.username : `User ${userId}`;
  };

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.order_total), 0);
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalUsers = users.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <BarChart className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-gray-300">
                <Users className="w-5 h-5" />
                <span>{user?.username || 'Admin'}</span>
              </div>

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

      {/* Navigation Tabs */}
      <div className="bg-gray-800/30 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'orders', label: 'Orders', icon: Receipt },
              { id: 'users', label: 'Users', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-blue-400'
                    : 'text-gray-400 border-transparent hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8" />
                  <span className="text-2xl font-bold">${totalRevenue.toFixed(2)}</span>
                </div>
                <p className="text-blue-100">Total Revenue</p>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-8 h-8" />
                  <span className="text-2xl font-bold">{totalProducts}</span>
                </div>
                <p className="text-purple-100">Total Products</p>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Receipt className="w-8 h-8" />
                  <span className="text-2xl font-bold">{totalOrders}</span>
                </div>
                <p className="text-green-100">Total Orders</p>
              </div>

              <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8" />
                  <span className="text-2xl font-bold">{totalUsers}</span>
                </div>
                <p className="text-orange-100">Total Users</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between bg-gray-700/30 p-4 rounded-lg">
                    <div>
                      <p className="text-white font-semibold">Order #{order.id}</p>
                      <p className="text-gray-400 text-sm">{getUserById(order.user_id)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">${order.order_total}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">Products Management</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({ name: '', description: '', price: '', stock: '', category: '', image: '' });
                  setShowProductForm(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-all">
                    <div className="text-4xl mb-4 text-center">{product.image}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{product.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-blue-400">${product.price}</span>
                      <span className="text-sm text-gray-400">Stock: {product.stock}</span>
                    </div>

                    <div className="flex gap-2">
                      {/* <button
                        onClick={() => openEditProduct(product)}
                        className="flex-1 flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg font-semibold transition-all"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button> */}
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-8">Orders Management</h2>
            
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-bold text-xl">Order #{order.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-400">Customer: <span className="text-white">{getUserById(order.user_id)}</span></p>
                      <p className="text-gray-400 text-sm">{formatDate(order.timestamp)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white">${order.order_total}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
                    {updatingOrderId === order.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        >
                          <option value="">Select Status</option>
                          <option value="pending">Pending</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, newStatus)}
                          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setUpdatingOrderId(null);
                            setNewStatus('');
                          }}
                          className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setUpdatingOrderId(order.id);
                          setNewStatus(order.status);
                        }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                      >
                        <Edit className="w-4 h-4" />
                        Update Status
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-8">Users Management</h2>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">ID</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Username</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-gray-700 hover:bg-gray-700/30 transition-all">
                      <td className="px-6 py-4 text-gray-300">{user.id}</td>
                      <td className="px-6 py-4 text-white font-semibold">{user.username}</td>
                      <td className="px-6 py-4 text-gray-300">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin' 
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowProductForm(false)}>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-white mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Product Name</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Enter product description"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Stock</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Category</label>
                <input
                  type="text"
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Electronics, Accessories, etc."
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Image (Emoji or URL)</label>
                <input
                  type="text"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  placeholder="🎧 or image URL"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all"
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
              <button
                onClick={() => setShowProductForm(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}