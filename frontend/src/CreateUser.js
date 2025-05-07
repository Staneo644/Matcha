import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './CreateUser.css'; // Add custom styles here
import DOMPurify from 'dompurify'; // Install with `npm install dompurify`

function CreateUser() {
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [lastName, setLastName] = useState('');
	const [firstName, setFirstName] = useState('');
	const [password, setPassword] = useState('');
	const [message, setMessage] = useState('');

	const navigate = useNavigate(); // Hook to navigate between routes

	const validatePassword = (password) => {
		const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
		return passwordRegex.test(password);
	};

	const handleRegister = (e) => {
		e.preventDefault();

		// Basic validation
		if (!email || !username || !lastName || !firstName || !password) {
			setMessage('Please fill in all fields.');
			return;
		}

		if (!validatePassword(password)) {
			setMessage('Password must be at least 8 characters long and include a number, a letter, and a special character.');
			return;
		}

		// Sanitize inputs
		const sanitizedEmail = DOMPurify.sanitize(email);
		const sanitizedUsername = DOMPurify.sanitize(username);
		const sanitizedLastName = DOMPurify.sanitize(lastName);
		const sanitizedFirstName = DOMPurify.sanitize(firstName);

		fetch('http://localhost:4567/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: sanitizedEmail,
				username: sanitizedUsername,
				lastName: sanitizedLastName,
				firstName: sanitizedFirstName,
				password,
			}),
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.success) {
					setMessage('Registration successful! Please check your email to verify your account.');
				} else {
					setMessage(data.message || 'Registration failed. Please try again.');
				}
			})
			.catch((error) => {
				console.error('Error:', error);
				setMessage('An error occurred. Please try again.');
			});
	};

	return (
		<div>
			<div className="background"> </div>
			<div className="create-user-container">
				<h1>Create an Account</h1>
				<form onSubmit={handleRegister} className="create-user-form">
						<input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(DOMPurify.sanitize(e.target.value))} required/>
					<input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(DOMPurify.sanitize(e.target.value))} required/>
					<input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(DOMPurify.sanitize(e.target.value))} required/>
					<input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(DOMPurify.sanitize(e.target.value))} required/>
					<input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
					<button type="submit">Register</button>
				</form>
				{message && <p className="message" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message) }} />}
				<button className="back-to-home-button" onClick={() => navigate('/')}>
					Back to Homepage
				</button>
			</div>
		</div>
	);
}

export default CreateUser;