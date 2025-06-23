import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:4567/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    })
      .then(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/');
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/dashboard">Matcha</Link>
      </div>
      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/browse">Browse</Link>
        <Link to="/chat">Chat</Link>
        <Link to="/notifications">Notifications</Link>
        <Link to="/profile">Profile</Link>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;