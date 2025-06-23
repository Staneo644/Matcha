import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Notifications.css';
import Navbar from './Navbar';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:4567/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error(data.error);
        } else {
          setNotifications(data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);
  
  const markAsRead = (notificationId) => {
    const token = localStorage.getItem('token');
    
    fetch(`http://localhost:4567/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error(data.error);
        } else {
          setNotifications(notifications.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true } 
              : notification
          ));
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };
  
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'like':
      case 'visit':
        navigate(`/user/${notification.senderId}`);
        break;
      case 'match':
        navigate('/chat');
        break;
      case 'message':
        navigate('/chat');
        break;
      default:
        break;
    }
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  return (
    <div className="notifications-page">
      <Navbar />
      
      <div className="notifications-container">
        <h1>Notifications</h1>
        
        {loading ? (
          <div className="loading">Loading notifications...</div>
        ) : notifications.length > 0 ? (
          <div className="notification-list">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-time">{formatTime(notification.timestamp)}</span>
                </div>
                {!notification.read && <div className="unread-indicator"></div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-notifications">
            <p>You have no notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
