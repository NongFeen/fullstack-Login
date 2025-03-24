import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './UserDashboard.css';

function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('browse');
  const [catalog, setCatalog] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role !== 'user') {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setUsername(decoded.username || 'User');
          fetchMockData();
        }
      } catch (error) {
        navigate('/login');
      }
    }
  }, [navigate]);

  const fetchMockData = () => {
    // Mock catalog data
    setCatalog([
      { id: 1, name: 'Thriller', artist: 'Michael Jackson', price: 29.99, category: 'vinyl', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/55/Michael_Jackson_-_Thriller.png/220px-Michael_Jackson_-_Thriller.png' },
      { id: 2, name: 'Back in Black', artist: 'AC/DC', price: 24.99, category: 'vinyl', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/92/ACDC_Back_in_Black.png' },
      { id: 3, name: 'Stairway to Heaven', artist: 'Led Zeppelin', price: 1.99, category: 'digital', imageUrl: 'https://www.ultimate-guitar.com/static/article/news/1/69761_ver1516630290.jpg' },
      { id: 4, name: 'Highway to Hell', artist: 'AC/DC', price: 199.99, category: 'digital', imageUrl: 'https://i.scdn.co/image/ab67616d0000b27351c02a77d09dfcd53c8676d0' },
      { id: 5, name: 'Dark Side of the Moon', artist: 'Pink Floyd', price: 27.99, category: 'vinyl', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png' },
      { id: 6, name: 'Abbey Road', artist: 'The Beatles', price: 26.99, category: 'vinyl', imageUrl: 'https://upload.wikimedia.org/wikipedia/th/4/42/Beatles_-_Abbey_Road.jpg' },
    ]);

    // Mock orders data
    setOrders([
      { id: 101, date: '2025-03-12', items: [
        { name: 'Thriller', artist: 'Michael Jackson', price: 29.99 }
      ], total: 29.99, status: 'Delivered' },
      { id: 102, date: '2025-03-05', items: [
        { name: 'Highway to Hell', artist: 'Pink Floyd', price: 199.99 }
      ], total: 199.99, status: 'Shipped' },
    ]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const checkout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    // Create a new order
    const newOrder = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      items: [...cart],
      total: total,
      status: 'Processing'
    };
    
    // Add to orders and clear cart
    setOrders([newOrder, ...orders]);
    setCart([]);
    alert('Order placed successfully!');
  };

  return (
    <div className="music-dashboard user-dashboard">
      <div className="dashboard-sidebar">
        <div className="dashboard-logo">
          <h2>FeenFeenFeen</h2>
          <div className="user-badge">MY MUSIC</div>
        </div>
        
        <div className="dashboard-nav">
          <button 
            className={`nav-item ${activeTab === 'browse' ? 'active' : ''}`} 
            onClick={() => setActiveTab('browse')}
          >
            Browse Music
          </button>
          <button 
            className={`nav-item ${activeTab === 'cart' ? 'active' : ''}`} 
            onClick={() => setActiveTab('cart')}
          >
            Cart ({cart.length})
          </button>
          <button 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} 
            onClick={() => setActiveTab('orders')}
          >
            My Orders
          </button>
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} 
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </div>
        
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome, {username}</h1>
          <p>Discover new music and expand your collection</p>
        </div>
        
        {activeTab === 'browse' && (
          <div className="dashboard-section">
            <h2>Browse Our Catalog</h2>
            
            <div className="catalog-filters">
              <button className="filter-button active">All</button>
              <button className="filter-button">Vinyl</button>
              <button className="filter-button">Digital</button>
              <button className="filter-button">Equipment</button>
            </div>
            
            <div className="catalog-grid">
              {catalog.map(item => (
                <div key={item.id} className="product-card">
                  <div className="product-image">
                    <img src={item.imageUrl} alt={item.name} />
                  </div>
                  <div className="product-details">
                    <h3>{item.name}</h3>
                    <p className="artist">{item.artist}</p>
                    <p className="price">${item.price.toFixed(2)}</p>
                    <div className="category-tag">{item.category}</div>
                  </div>
                  <button className="add-to-cart-button" onClick={() => addToCart(item)}>
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'cart' && (
          <div className="dashboard-section">
            <h2>Your Cart</h2>
            
            {cart.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🛒</div>
                <p>Your cart is empty</p>
                <button className="browse-button" onClick={() => setActiveTab('browse')}>
                  Browse Music
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="item-image">
                        <img src={item.imageUrl} alt={item.name} />
                      </div>
                      <div className="item-details">
                        <h3>{item.name}</h3>
                        <p className="artist">{item.artist}</p>
                        <p className="category">{item.category}</p>
                      </div>
                      <div className="item-price">${item.price.toFixed(2)}</div>
                      <button className="remove-button" onClick={() => removeFromCart(item.id)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="cart-summary">
                  <div className="cart-total">
                    <span>Total:</span>
                    <span>${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
                  </div>
                  <button className="checkout-button" onClick={checkout}>
                    Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        
        {activeTab === 'orders' && (
          <div className="dashboard-section">
            <h2>Your Orders</h2>
            
            {orders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <p>You haven't placed any orders yet</p>
                <button className="browse-button" onClick={() => setActiveTab('browse')}>
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-info">
                        <h3>Order #{order.id}</h3>
                        <p className="order-date">Placed on {order.date}</p>
                      </div>
                      <div className={`order-status ${order.status.toLowerCase()}`}>
                        {order.status}
                      </div>
                    </div>
                    
                    <div className="order-items">
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <span className="item-name">{item.name}</span>
                          <span className="item-artist">by {item.artist}</span>
                          <span className="item-price">${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="order-footer">
                      <div className="order-total">
                        Total: ${order.total.toFixed(2)}
                      </div>
                      <button className="track-button">Track Order</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'profile' && (
          <div className="dashboard-section">
            <h2>Your Profile</h2>
            
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div className="profile-name">
                  <h3>{username}</h3>
                  <p className="profile-role">Music Enthusiast</p>
                </div>
              </div>
              
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">{orders.length}</span>
                  <span className="stat-label">Orders</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{orders.reduce((sum, order) => sum + order.items.length, 0)}</span>
                  <span className="stat-label">Items Purchased</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">⭐</span>
                  <span className="stat-label">Standard Member</span>
                </div>
              </div>
              
              <div className="profile-section">
                <h4>Account Settings</h4>
                <div className="form-group">
                  <label>Email Notifications</label>
                  <div className="toggle-switch">
                    <input type="checkbox" id="notifications" defaultChecked />
                    <label htmlFor="notifications"></label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Change Password</label>
                  <button className="secondary-button">Update Password</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;