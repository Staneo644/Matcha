import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import './App.css';
import CreateUser from './CreateUser';
import Profile from './Profile';
import Dashboard from './Dashboard';
import Browse from './Browse';
import UserProfile from './UserProfile';
import Chat from './Chat';
import Notifications from './Notifications';
import VerifyEmail from './VerifyEmail';
import ResetPassword from './ResetPassword';
import ProtectedRoute from './ProtectedRoute';

function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [message, setMessage] = useState('');
	const navigate = useNavigate();

	const handleLogin = (e) => {
		e.preventDefault();

		// Basic validation
		if (!email || !password) {
			setMessage('Please fill in all fields.');
			return;
		}

		// Send sanitized data to the backend
		fetch('http://localhost:4567/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				email: email,
				password: password,
			}).toString(),
			credentials: 'include'
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.success) {
					localStorage.setItem('token', data.token);
					localStorage.setItem('userId', data.userId);
					setMessage('Login successful!');
					navigate('/dashboard');
				} else {
					setMessage(data.error || 'Invalid credentials!');
				}
			})
			.catch((error) => {
				console.error('Error:', error);
				setMessage('An error occurred. Please try again.');
			});
	};

	const handleForgotPassword = () => {
		navigate('/reset-password');
	};

	return (
		<div>
			<div className="background"></div>
			<div className="login-container">
				<h1>Welcome to Matcha</h1>
				<form className="login-form" onSubmit={handleLogin}>
					<input 
						type="email" 
						placeholder="Email" 
						value={email} 
						onChange={(e) => setEmail(e.target.value)} 
						required
					/>
					<input 
						type="password" 
						placeholder="Password" 
						value={password} 
						onChange={(e) => setPassword(e.target.value)} 
						required
					/>
					<button type="submit">Log In</button>
				</form>
				{message && <p className="message">{message}</p>}
				<p className="create-account-message">
					Don't have an account?
					<button className="create-account-button" onClick={() => navigate('/create-user')}>
						Create an Account
					</button>
				</p>
				<p className="forgot-password">
					<button className="forgot-password-button" onClick={handleForgotPassword}>
						Forgot Password?
					</button>
				</p>
			</div>
		</div>
	);
}

export default function AppWrapper() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Login />} />
				<Route path="/create-user" element={<CreateUser />} />
				<Route path="/verify-email/:token" element={<VerifyEmail />} />
				<Route path="/reset-password" element={<ResetPassword />} />
				<Route path="/dashboard" element={
					<ProtectedRoute>
						<Dashboard />
					</ProtectedRoute>
				} />
				<Route path="/profile" element={
					<ProtectedRoute>
						<Profile />
					</ProtectedRoute>
				} />
				<Route path="/browse" element={
					<ProtectedRoute>
						<Browse />
					</ProtectedRoute>
				} />
				<Route path="/user/:userId" element={
					<ProtectedRoute>
						<UserProfile />
					</ProtectedRoute>
				} />
				<Route path="/chat" element={
					<ProtectedRoute>
						<Chat />
					</ProtectedRoute>
				} />
				<Route path="/notifications" element={
					<ProtectedRoute>
						<Notifications />
					</ProtectedRoute>
				} />
			</Routes>
		</Router>
	);
}
