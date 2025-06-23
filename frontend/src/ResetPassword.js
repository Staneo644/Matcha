import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ResetPassword.css';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  const handleRequestReset = (e) => {
    e.preventDefault();
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address.');
      return;
    }
    
    fetch('http://localhost:4567/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setMessage(data.error);
        } else {
          setMessage('Password reset instructions have been sent to your email.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setMessage('An error occurred. Please try again.');
      });
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    
    // Password validation
    if (password.length < 8) {
      setMessage('Password must be at least 8 characters long.');
      return;
    }
    
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number.');
      return;
    }
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    
    fetch('http://localhost:4567/reset-password/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setMessage(data.error);
        } else {
          setMessage('Password has been reset successfully.');
          setTimeout(() => {
            navigate('/');
          }, 3000);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setMessage('An error occurred. Please try again.');
      });
  };

  return (
    <div>
      <div className="background"></div>
      <div className="reset-password-container">
        <h1>Reset Password</h1>
        
        {!token && (
          <form className="reset-password-form" onSubmit={handleRequestReset}>
            <p>Enter your email address to receive password reset instructions.</p>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Request Reset</button>
          </form>
        )}
        
        {token && (
          <form className="reset-password-form" onSubmit={handleResetPassword}>
            <p>Enter your new password.</p>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit">Reset Password</button>
          </form>
        )}
        
        {message && <p className="message">{message}</p>}
        <p className="login-link">
          Remember your password? <button onClick={() => navigate('/')}>Log In</button>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;