import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import CreateUser from './CreateUser'; // Import the CreateUser component

function App() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [message, setMessage] = useState('');

	const handleLogin = (e) => {
		e.preventDefault();

		// Basic validation
		if (!email || !password) {
			setMessage('Please fill in all fields.');
			return;
		}

		// Email format validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			setMessage('Please enter a valid email address.');
			return;
		}

		// Password length validation
		if (password.length < 8) {
			setMessage('Password must be at least 8 characters long.');
			return;
		}

		// Send sanitized data to the backend
		fetch('http://localhost:4567/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password }),
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.success) {
					setMessage('Login successful!');
				} else {
					setMessage('Invalid credentials!');
				}
			})
			.catch((error) => {
				console.error('Error:', error);
				setMessage('An error occurred. Please try again.');
			});
	};

	const navigate = useNavigate(); // Hook to navigate between routes

	return (
		<div>
			<div className="background"></div>
			<div className="login-container">
				<h1>Welcome to Matcha</h1>
				<form className="login-form" onSubmit={handleLogin}>
					<input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
					<input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
					<button type="submit">Log In</button>
				</form>
				{message && <p className="message">{message}</p>}
				<p className="create-account-message">
					Don't have an account?
				<button className="create-account-button" onClick={() => navigate('/create-user')}>
					Create an Account
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
				<Route path="/" element={<App />} />
				<Route path="/create-user" element={<CreateUser />} />
			</Routes>
		</Router>
	);
}