import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Navbar from './Navbar';

function Dashboard() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:4567/suggestions', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setMessage(data.error);
        } else {
          setSuggestions(data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setMessage('Failed to load suggestions.');
        setLoading(false);
      });
  }, []);
  
  const viewProfile = (userId) => {
    navigate(`/user/${userId}`);
  };
  
  return (
    <div className="dashboard-page">
      <Navbar />
      
      <div className="dashboard-container">
        <h1>Welcome to Matcha</h1>
        
        {loading ? (
          <div className="loading">Loading suggestions...</div>
        ) : message ? (
          <div className="message">{message}</div>
        ) : (
          <div className="suggestions">
            <h2>Suggested Matches</h2>
            
            {suggestions.length > 0 ? (
              <div className="suggestion-cards">
                {suggestions.map(user => (
                  <div key={user.id} className="suggestion-card">
                    <div className="suggestion-image">
                      <img 
                        src={user.profilePicture || '/default-profile.png'} 
                        alt={`${user.firstName} ${user.lastName}`} 
                      />
                    </div>
                    <div className="suggestion-info">
                      <h3>{user.firstName} {user.lastName}, {user.age}</h3>
                      <p className="location">{user.location}</p>
                      <p className="fame">Fame Rating: {user.fame}</p>
                      <div className="tags">
                        {user.interests.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <button 
                      className="view-profile-button" 
                      onClick={() => viewProfile(user.id)}
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No suggestions available. Try updating your profile to get better matches.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;