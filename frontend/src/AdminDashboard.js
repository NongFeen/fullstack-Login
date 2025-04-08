import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', artist: '', price: '', category: 'vinyl', stock: '', imageUrl: '' });
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
   const token = localStorage.getItem('token');
    if (!token) {
      // navigate('/login');
    } else {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role !== 'admin') {
          localStorage.removeItem('token');
          // navigate('/login');
        } else {
          // Fetch mock data for demonstration
          fetchMockData(); 
        }
      } catch (error) {
        // navigate('/login');
      }
    }
  }, [navigate]);

  const fetchMockData = () => {
    // Mock inventory data
    setInventory([
      { id: 1, name: 'Thriller', artist: 'Michael Jackson', price: 29.99, category: 'vinyl', stock: 15, imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/55/Michael_Jackson_-_Thriller.png/220px-Michael_Jackson_-_Thriller.png' },
      { id: 2, name: 'Back in Black', artist: 'AC/DC', price: 24.99, category: 'vinyl', stock: 8, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/92/ACDC_Back_in_Black.png' },
      { id: 3, name: 'Stairway to Heaven', artist: 'Led Zeppelin', price: 1.99, category: 'digital', stock: 999, imageUrl: 'https://www.ultimate-guitar.com/static/article/news/1/69761_ver1516630290.jpg' },
      { id: 4, name: 'Highway to Hell', artist: 'AC/DC', price: 199.99, category: 'digital', stock: 5, imageUrl: 'https://i.scdn.co/image/ab67616d0000b27351c02a77d09dfcd53c8676d0' },
    ]);

    // Mock users data
    setUsers([
      { id: 1, username: 'john_doe', role: 'user', lastLogin: '2025-03-15', purchases: 3 },
      { id: 2, username: 'jane_smith', role: 'user', lastLogin: '2025-03-17', purchases: 7 },
      { id: 3, username: 'manager1', role: 'manager', lastLogin: '2025-03-18', purchases: 0 },
    ]);

    // Mock orders data
    setOrders([
      { id: 101, user: 'john_doe', date: '2025-03-12', items: 2, total: 54.98, status: 'Shipped' },
      { id: 102, user: 'jane_smith', date: '2025-03-16', items: 1, total: 199.99, status: 'Processing' },
      { id: 103, user: 'jane_smith', date: '2025-03-18', items: 3, total: 32.97, status: 'Pending' },
    ]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    // navigate('/login');
  };

  const handleAddProduct = () => {
    // In a real app, you'd make an API call here
    const newId = inventory.length > 0 ? Math.max(...inventory.map(item => item.id)) + 1 : 1;
    const product = { ...newProduct, id: newId, price: parseFloat(newProduct.price), stock: parseInt(newProduct.stock) };
    setInventory([...inventory, product]);
    setNewProduct({ name: '', artist: '', price: '', category: 'vinyl', stock: '', imageUrl: '' });
    document.getElementById('addProductForm').style.display = 'none';
  };

  const handleDeleteProduct = (id) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const handleUpdateUserRole = (id, newRole) => {
    setUsers(users.map(user => user.id === id ? { ...user, role: newRole } : user));
  };

  const handleUpdateOrderStatus = (id, newStatus) => {
    setOrders(orders.map(order => order.id === id ? { ...order, status: newStatus } : order));
  };

  return (
    <div className="music-dashboard">
      <div className="dashboard-sidebar">
        <div className="dashboard-logo">
          <h2>FeenFeenFeen</h2>
          <div className="admin-badge">ADMIN</div>
        </div>
        
        <div className="dashboard-nav">
          <button 
            className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`} 
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </button>
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} 
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} 
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button 
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} 
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>
        
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Complete control over your music store</p>
        </div>
        
        {activeTab === 'inventory' && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Inventory Management</h2>
              <button className="add-button" onClick={() => document.getElementById('addProductForm').style.display = 'block'}>
                Add New Product
              </button>
            </div>
            
            <div id="addProductForm" className="add-form" style={{ display: 'none' }}>
              <h3>Add New Product</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input 
                    type="text" 
                    value={newProduct.name} 
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Artist/Brand</label>
                  <input 
                    type="text" 
                    value={newProduct.artist} 
                    onChange={(e) => setNewProduct({...newProduct, artist: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input 
                    type="number" 
                    value={newProduct.price} 
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={newProduct.category} 
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    <option value="vinyl">Vinyl</option>
                    <option value="cd">CD</option>
                    <option value="digital">Digital</option>
                    <option value="equipment">Equipment</option>
                    <option value="merchandise">Merchandise</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Stock</label>
                  <input 
                    type="number" 
                    value={newProduct.stock} 
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input 
                    type="text" 
                    value={newProduct.imageUrl} 
                    onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                    placeholder="Leave blank for placeholder"
                  />
                </div>
              </div>
              
              <div className="form-buttons">
                <button onClick={handleAddProduct}>Add Product</button>
                <button onClick={() => document.getElementById('addProductForm').style.display = 'none'}>Cancel</button>
              </div>
            </div>
            
            <div className="inventory-grid">
              {inventory.map(item => (
                <div key={item.id} className="product-card">
                  <div className="product-image">
                    <img src={item.imageUrl || '/api/placeholder/200/200'} alt={item.name} />
                  </div>
                  <div className="product-details">
                    <h3>{item.name}</h3>
                    <p className="artist">{item.artist}</p>
                    <p className="price">${item.price.toFixed(2)}</p>
                    <p className="stock">In stock: {item.stock}</p>
                    <div className="category-tag">{item.category}</div>
                  </div>
                  <div className="product-actions">
                    <button className="edit-button">Edit</button>
                    <button className="delete-button" onClick={() => handleDeleteProduct(item.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="dashboard-section">
            <h2>User Management</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Last Login</th>
                    <th>Purchases</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>
                        <select 
                          value={user.role} 
                          onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>{user.lastLogin}</td>
                      <td>{user.purchases}</td>
                      <td>
                        <button className="small-button">Details</button>
                        <button className="small-button delete">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'orders' && (
          <div className="dashboard-section">
            <h2>Order Management</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>User</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.user}</td>
                      <td>{order.date}</td>
                      <td>{order.items}</td>
                      <td>${order.total.toFixed(2)}</td>
                      <td>
                        <select 
                          value={order.status} 
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className={`status-${order.status.toLowerCase()}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button className="small-button">Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="dashboard-section">
            <h2>Analytics Dashboard</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Top Selling Products</h3>
                <div className="chart-placeholder">
                  <div className="bar-chart">
                    <div className="bar" style={{height: '80%'}}><span>Thriller</span></div>
                    <div className="bar" style={{height: '65%'}}><span>Back in Black</span></div>
                    <div className="bar" style={{height: '45%'}}><span>Headphones</span></div>
                    <div className="bar" style={{height: '30%'}}><span>Digital</span></div>
                  </div>
                </div>
              </div>
              
              <div className="analytics-card">
                <h3>Recent Activity</h3>
                <div className="activity-feed">
                  <div className="activity-item">
                    <div className="activity-icon sale"></div>
                    <div className="activity-content">
                      <p>New order #104 placed by user <strong>john_doe</strong></p>
                      <span className="timestamp">10 minutes ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon inventory"></div>
                    <div className="activity-content">
                      <p>Stock level low for <strong>Back in Black</strong></p>
                      <span className="timestamp">2 hours ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon user"></div>
                    <div className="activity-content">
                      <p>New user registered: <strong>music_lover22</strong></p>
                      <span className="timestamp">5 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default AdminDashboard;