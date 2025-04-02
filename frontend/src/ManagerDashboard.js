import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import './ManagerDashboard.css';

function ManagerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      navigate('/login');
    } else {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role !== 'manager') {
          Cookies.remove('token');
          navigate('/login');
        } else {
          fetchMockData();
        }
      } catch (error) {
        navigate('/login');
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

    // Mock orders data
    setOrders([
      { id: 101, user: 'john_doe', date: '2025-03-12', items: 2, total: 54.98, status: 'Shipped' },
      { id: 102, user: 'jane_smith', date: '2025-03-16', items: 1, total: 199.99, status: 'Processing' },
      { id: 103, user: 'jane_smith', date: '2025-03-18', items: 3, total: 32.97, status: 'Pending' },
    ]);

    // Mock stats data
    setStats({
      totalSales: 1245.67,
      monthlyRevenue: 287.94,
      ordersThisMonth: 12,
      lowStockItems: 3
    });
  };

  const handleLogout = () => {
    Cookies.remove('token');
    navigate('/login');
  };

  const handleUpdateStock = (id, newStock) => {
    setInventory(inventory.map(item => item.id === id ? { ...item, stock: parseInt(newStock) } : item));
  };

  const handleUpdateOrderStatus = (id, newStatus) => {
    setOrders(orders.map(order => order.id === id ? { ...order, status: newStatus } : order));
  };

  return (
    <div className="music-dashboard manager-dashboard">
      <div className="dashboard-sidebar">
        <div className="dashboard-logo">
          <h2>FeenFeenFeen</h2>
          <div className="manager-badge">MANAGER</div>
        </div>
        
        <div className="dashboard-nav">
          <button 
            className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`} 
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </button>
          <button 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} 
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button 
            className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`} 
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
        </div>
        
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Manager Dashboard</h1>
          <p>Manage inventory and track orders</p>
        </div>
        
        {activeTab === 'inventory' && (
          <div className="dashboard-section">
            <h2>Inventory Management</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Artist/Brand</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>
                        <div className="product-cell">
                          <img src={item.imageUrl} alt={item.name} className="product-thumbnail" />
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td>{item.artist}</td>
                      <td>
                        <div className="category-tag">{item.category}</div>
                      </td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>
                        <input 
                          type="number" 
                          value={item.stock} 
                          onChange={(e) => handleUpdateStock(item.id, e.target.value)}
                          className="stock-input"
                          min="0"
                        />
                      </td>
                      <td>
                        <button className="small-button">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="low-stock-alert">
              <h3>Low Stock Alert</h3>
              <p>3 items are running low on stock</p>
              <ul>
                <li>Back in Black (8 left)</li>
                <li>Pro Headphones (5 left)</li>
                <li>Vinyl Cleaning Kit (2 left)</li>
              </ul>
            </div>
          </div>
        )}
        
        {activeTab === 'orders' && (
          <div className="dashboard-section">
            <h2>Order Management</h2>
            <div className="filter-row">
              <div className="filter-group">
                <label>Filter by Status:</label>
                <select className="filter-select">
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Date Range:</label>
                <input type="date" className="date-input" />
                <span>to</span>
                <input type="date" className="date-input" />
              </div>
            </div>
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
        
        {activeTab === 'stats' && (
          <div className="dashboard-section">
            <h2>Store Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon sales"></div>
                <div className="stat-content">
                  <h3>Total Sales</h3>
                  <p className="stat-value">${stats.totalSales?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon revenue"></div>
                <div className="stat-content">
                  <h3>Monthly Revenue</h3>
                  <p className="stat-value">${stats.monthlyRevenue?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon orders"></div>
                <div className="stat-content">
                  <h3>Orders This Month</h3>
                  <p className="stat-value">{stats.ordersThisMonth || 0}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon inventory"></div>
                <div className="stat-content">
                  <h3>Low Stock Items</h3>
                  <p className="stat-value">{stats.lowStockItems || 0}</p>
                </div>
              </div>
            </div>
            <div className="chart-container">
              <h3>Daily Sales</h3>
              <div className="chart-placeholder">
                <div className="bar-chart">
                  <div className="bar" style={{height: '50%'}}><span>Mon</span></div>
                  <div className="bar" style={{height: '65%'}}><span>Tue</span></div>
                  <div className="bar" style={{height: '45%'}}><span>Wed</span></div>
                  <div className="bar" style={{height: '80%'}}><span>Thu</span></div>
                  <div className="bar" style={{height: '60%'}}><span>Fri</span></div>
                  <div className="bar" style={{height: '75%'}}><span>Sat</span></div>
                  <div className="bar" style={{height: '40%'}}><span>Sun</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManagerDashboard;