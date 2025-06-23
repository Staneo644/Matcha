import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './VerifyEmail.css';

function VerifyEmail() {
  const [status, setStatus] = useState('verifying');
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:4567/verify/${token}`)
      .then(response => {
        if (response.ok) {
          setStatus('success');
        } else {
          return response.json().then(data => {
            throw new Error(data.error || 'Verification failed');
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setStatus('error');
      });
  }, [token]);

  const handleGoToLogin = () => {
    navigate('/');
  };

  return (
    <div>
      <div className="background"></div>
      <div className="verify-container">
        <h1>Email Verification</h1>
        
        {status === 'verifying' && (
          <div className="verify-message">
            <p>Verifying your email address...</p>
            <div className="loading-spinner"></div>
          </div>
        )}
        
        {status === 'success' && (
          <div className="verify-message success">
            <p>Your email has been successfully verified!</p>
            <p>You can now log in to your account.</p>
            <button onClick={handleGoToLogin}>Go to Login</button>
          </div>
        )}
        
        {status === 'error' && (
          <div className="verify-message error">
            <p>There was an error verifying your email.</p>
            <p>The verification link may be invalid or expired.</p>
            <button onClick={handleGoToLogin}>Go to Login</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;