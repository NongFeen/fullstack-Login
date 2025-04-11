import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./UserDashboard.css";

function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("browse");
  const [catalog, setCatalog] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [username, setUsername] = useState("");

  // Add these states for profile functionality
  const [profile, setProfile] = useState({
    name: "",
    surname: "",
    email: "",
    age: "",
    tel: "",
  });
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {

    axios.get('http://localhost:5000/auth/me', { withCredentials: true })
      .then(response => {
        const username = response.data.username;
        setUsername(username || 'User')
        // Redirect based on role
      })
      .catch(error => {
        console.error("User not authenticated", error);
        navigate('/login');
      })
    try {
        fetchMockData();
        // Fetch user profile data when on profile tab
        if (activeTab === 'profile') {
          fetchUserProfile();
        }
      }
    catch (error) {
    }
    fetchMockData();
  }, [navigate, activeTab]);

  const fetchMockData = () => {
    // Mock catalog data
    setCatalog([
      {
        id: 1,
        name: "Thriller",
        artist: "Michael Jackson",
        price: 29.99,
        category: "vinyl",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/en/thumb/5/55/Michael_Jackson_-_Thriller.png/220px-Michael_Jackson_-_Thriller.png",
      },
      {
        id: 2,
        name: "Back in Black",
        artist: "AC/DC",
        price: 24.99,
        category: "vinyl",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/9/92/ACDC_Back_in_Black.png",
      },
      {
        id: 3,
        name: "Stairway to Heaven",
        artist: "Led Zeppelin",
        price: 1.99,
        category: "digital",
        imageUrl:
          "https://www.ultimate-guitar.com/static/article/news/1/69761_ver1516630290.jpg",
      },
      {
        id: 4,
        name: "Highway to Hell",
        artist: "AC/DC",
        price: 199.99,
        category: "digital",
        imageUrl:
          "https://i.scdn.co/image/ab67616d0000b27351c02a77d09dfcd53c8676d0",
      },
      {
        id: 5,
        name: "Dark Side of the Moon",
        artist: "Pink Floyd",
        price: 27.99,
        category: "vinyl",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png",
      },
      {
        id: 6,
        name: "Abbey Road",
        artist: "The Beatles",
        price: 26.99,
        category: "vinyl",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/th/4/42/Beatles_-_Abbey_Road.jpg",
      },
    ]);

    // Mock orders data
    setOrders([
      {
        id: 101,
        date: "2025-03-12",
        items: [{ name: "Thriller", artist: "Michael Jackson", price: 29.99 }],
        total: 29.99,
        status: "Delivered",
      },
      {
        id: 102,
        date: "2025-03-05",
        items: [
          { name: "Highway to Hell", artist: "Pink Floyd", price: 199.99 },
        ],
        total: 199.99,
        status: "Shipped",
      },
    ]);
  };
  axios.get('http://localhost:5000/auth/me', { withCredentials: true })
      .then(response => {
        const username = response.data.username;
        setUsername(username || 'User')
        // Redirect based on role
      })
      .catch(error => {
        console.error("User not authenticated", error);
        navigate('/login');
      })

  // Add function to fetch user profile
  const fetchUserProfile = async () => {
    setLoading(true); 
    try {
      const response = await axios.get('http://localhost:5000/user/profile', {
        withCredentials: true,  // Ensures cookies are sent with the request
        headers: {
          'Content-Type': 'application/json', // Set the correct content type
        }
      });
  
      // Set profile data, handling null values
      const profileData = response.data;
      setProfile({
        name: profileData.name || "",
        surname: profileData.surname || "",
        email: profileData.email || "",
        age: profileData.age || "",
        tel: profileData.tel || "",
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Add function to handle profile form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  // Add function to handle profile form submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
  
    try {
      const response = await axios.put(
        'http://localhost:5000/user/profile',
        profile,
        {
          withCredentials: true, // This sends the cookie along with the request
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.status === 200) {
        setSuccess('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
  
      if (err.response) {
        setError(err.response.data?.message || 'Server error. Please try again.');
      } else if (err.request) {
        setError('No response from server. Check your network.');
      } else {
        setError('An error occurred. Please try again.');
      }
    }
      
  };

  // Function to cancel profile editing
  const handleProfileCancel = () => {
    // Reset to original values by re-fetching
    fetchUserProfile();
    setError('');
    setSuccess('');
  };

  const handleLogout = () => {
    axios.get('http://localhost:5000/logout', { withCredentials: true })
      .then(() => navigate('/login'))
      .catch(() => navigate('/login'));
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const checkout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // Calculate total
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    // Create a new order
    const newOrder = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      items: [...cart],
      total: total,
      status: "Processing",
    };

    // Add to orders and clear cart
    setOrders([newOrder, ...orders]);
    setCart([]);
    alert("Order placed successfully!");
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
            className={`nav-item ${activeTab === "browse" ? "active" : ""}`}
            onClick={() => setActiveTab("browse")}
          >
            Browse Music
          </button>
          <button
            className={`nav-item ${activeTab === "cart" ? "active" : ""}`}
            onClick={() => setActiveTab("cart")}
          >
            Cart ({cart.length})
          </button>
          <button
            className={`nav-item ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            My Orders
          </button>
          <button
            className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
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
          <p>
            {activeTab === "profile"
              ? "Manage your profile information"
              : "Discover new music and expand your collection"}
          </p>
        </div>

        {activeTab === "browse" && (
          <div className="dashboard-section">
            <h2>Browse Our Catalog</h2>

            <div className="catalog-filters">
              <button className="filter-button active">All</button>
              <button className="filter-button">Vinyl</button>
              <button className="filter-button">Digital</button>
              <button className="filter-button">Equipment</button>
            </div>

            <div className="catalog-grid">
              {catalog.map((item) => (
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
                  <button
                    className="add-to-cart-button"
                    onClick={() => addToCart(item)}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "cart" && (
          <div className="dashboard-section">
            <h2>Your Cart</h2>

            {cart.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">&#128722;</div>
                <p>Your cart is empty</p>
                <button 
                  className="browse-button"
                  onClick={() => setActiveTab("browse")}
                >
                  Browse Music
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
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
                      <button
                        className="remove-button"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div className="cart-total">
                    <span>Total:</span>
                    <span>
                      $
                      {cart
                        .reduce((sum, item) => sum + item.price, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <button className="checkout-button" onClick={checkout}>
                    Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="dashboard-section">
            <h2>Your Orders</h2>

            {orders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">&#128230;</div>
                <p>You haven't placed any orders yet</p>
                <button
                  className="browse-button"
                  onClick={() => setActiveTab("browse")}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-info">
                        <h3>Order #{order.id}</h3>
                        <p className="order-date">Placed on {order.date}</p>
                      </div>
                      <div
                        className={`order-status ${order.status.toLowerCase()}`}
                      >
                        {order.status}
                      </div>
                    </div>

                    <div className="order-items">
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <span className="item-name">{item.name}</span>
                          <span className="item-artist">by {item.artist}</span>
                          <span className="item-price">
                            ${item.price.toFixed(2)}
                          </span>
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

        {activeTab === "profile" && (
          <div className="dashboard-section">
            <h2>Your Profile</h2>

            <div className="profile-container">
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {profile.name
                      ? profile.name.charAt(0).toUpperCase()
                      : username.charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-name">
                    <h3>
                      {profile.name
                        ? `${profile.name} ${profile.surname}`
                        : username}
                    </h3>
                    <p className="profile-role">Music Enthusiast</p>
                  </div>
                </div>

                {loading ? (
                  <div className="loading-indicator">
                    Loading your profile information...
                  </div>
                ) : (
                  <>
                    {error && <div className="error-message">{error}</div>}
                    {success && (
                      <div className="success-message">{success}</div>
                    )}

                    <form
                      onSubmit={handleProfileSubmit}
                      className="profile-form"
                    >
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="firstName">First Name</label>
                          <input
                            id="firstName"
                            type="text"
                            name="name"
                            value={profile.name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="music-input"
                            placeholder="Enter your first name"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="lastName">Last Name</label>
                          <input
                            id="lastName"
                            type="text"
                            name="surname"
                            value={profile.surname}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="music-input"
                            placeholder="Enter your last name"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={profile.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="music-input"
                          placeholder="Enter your email"
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="age">Age</label>
                          <input
                            id="age"
                            type="number"
                            name="age"
                            value={profile.age}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="music-input"
                            placeholder="Enter your age"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="phoneNumber">Phone Number</label>
                          <input
                            id="phoneNumber"
                            type="tel"
                            name="tel"
                            value={profile.tel}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="music-input"
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>

                      <div className="profile-actions">
                        {isEditing ? (
                          <>
                            <button type="submit" className="update-button">
                              Save Changes
                            </button>
                            <button
                              type="button"
                              className="cancel-button"
                              onClick={handleProfileCancel}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="edit-button"
                            onClick={() => setIsEditing(true)}
                          >
                            Edit Profile
                          </button>
                        )}
                      </div>
                    </form>

                    <div className="profile-section">
                      <h4>Account Settings</h4>
                      <div className="form-group">
                        <label htmlFor="notifications">
                          Email Notifications
                        </label>
                        <div className="toggle-switch">
                          <input
                            type="checkbox"
                            id="notifications"
                            defaultChecked
                          />
                          <label htmlFor="notifications" aria-label="Enable notifications">Enable notifications</label>
                        </div>
                      </div>
                      <div className="form-group">
                        <span id="passwordLabel">Change Password</span>
                        <button
                          className="secondary-button"
                          aria-labelledby="passwordLabel"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="membership-card">
                <h3>Membership Status</h3>
                <div className="membership-badge">Standard</div>
                <p>Joined: March 2025</p>
                <ul className="membership-benefits">
                  <li>Free shipping on orders over $50</li>
                  <li>Early access to new releases</li>
                  <li>Exclusive member-only discounts</li>
                  <li>Personalized recommendations</li>
                </ul>
                <button className="upgrade-button">Upgrade to Premium</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
