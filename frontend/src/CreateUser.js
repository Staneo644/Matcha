import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateUser.css';
import DOMPurify from 'dompurify';

function CreateUser() {
	const [formData, setFormData] = useState({
		email: '',
		pseudo: '',
		firstName: '',
		lastName: '',
		password: '',
		confirmPassword: '',
		birthday: '',
		gender: '',
		orientation: '',
		location: ''
	});
	const [message, setMessage] = useState('');
	const [step, setStep] = useState(1);
	const navigate = useNavigate();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value
		});
	};

	const validateStep1 = () => {
		const { email, pseudo, firstName, lastName, password, confirmPassword } = formData;
		
		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			setMessage('Please enter a valid email address.');
			return false;
		}
		
		// Password validation
		if (password.length < 8) {
			setMessage('Password must be at least 8 characters long.');
			return false;
		}
		
		if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
			setMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number.');
			return false;
		}
		
		if (password !== confirmPassword) {
			setMessage('Passwords do not match.');
			return false;
		}
		
		// Other validations
		if (!pseudo || !firstName || !lastName) {
			setMessage('Please fill in all required fields.');
			return false;
		}
		
		return true;
	};

	const validateStep2 = () => {
		const { birthday, gender, orientation, location } = formData;
		
		// Birthday validation
		if (!birthday) {
			setMessage('Please enter your birthday.');
			return false;
		}
		
		// Calculate age
		const birthDate = new Date(birthday);
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		
		if (age < 18) {
			setMessage('You must be at least 18 years old to register.');
			return false;
		}
		
		// Other validations
		if (!gender || !orientation || !location) {
			setMessage('Please fill in all required fields.');
			return false;
		}
		
		return true;
	};

	const handleNextStep = () => {
		if (step === 1 && validateStep1()) {
			setMessage('');
			setStep(2);
		}
	};

	const handlePrevStep = () => {
		setMessage('');
		setStep(1);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		
		if (!validateStep2()) {
			return;
		}
		
		// Sanitize data
		const sanitizedData = Object.keys(formData).reduce((acc, key) => {
			acc[key] = typeof formData[key] === 'string' ? DOMPurify.sanitize(formData[key]) : formData[key];
			return acc;
		}, {});
		
		// Send data to backend
		fetch('http://localhost:4567/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(sanitizedData)
		})
			.then(response => response.json())
			.then(data => {
				if (data.error) {
					setMessage(data.error);
				} else {
					setMessage('Registration successful! Please check your email to verify your account.');
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
			<div className="create-user-container">
				<h1>Create Your Account</h1>
				<p className="step-indicator">Step {step} of 2</p>
				
				{step === 1 && (
					<form className="create-user-form">
						<input
							type="email"
							name="email"
							placeholder="Email"
							value={formData.email}
							onChange={handleChange}
							required
						/>
						<input
							type="text"
							name="pseudo"
							placeholder="Username"
							value={formData.pseudo}
							onChange={handleChange}
							required
						/>
						<input
							type="text"
							name="firstName"
							placeholder="First Name"
							value={formData.firstName}
							onChange={handleChange}
							required
						/>
						<input
							type="text"
							name="lastName"
							placeholder="Last Name"
							value={formData.lastName}
							onChange={handleChange}
							required
						/>
						<input
							type="password"
							name="password"
							placeholder="Password"
							value={formData.password}
							onChange={handleChange}
							required
						/>
						<input
							type="password"
							name="confirmPassword"
							placeholder="Confirm Password"
							value={formData.confirmPassword}
							onChange={handleChange}
							required
						/>
						<button type="button" onClick={handleNextStep}>Next</button>
					</form>
				)}
				
				{step === 2 && (
					<form className="create-user-form" onSubmit={handleSubmit}>
						<input
							type="date"
							name="birthday"
							value={formData.birthday}
							onChange={handleChange}
							required
						/>
						<select
							name="gender"
							value={formData.gender}
							onChange={handleChange}
							required
						>
							<option value="">Select Gender</option>
							<option value="M">Male</option>
							<option value="W">Female</option>
							<option value="O">Other</option>
						</select>
						<select
							name="orientation"
							value={formData.orientation}
							onChange={handleChange}
							required
						>
							<option value="">Select Sexual Preference</option>
							<option value="M">Male</option>
							<option value="W">Female</option>
							<option value="O">Both</option>
						</select>
						<input
							type="text"
							name="location"
							placeholder="Location"
							value={formData.location}
							onChange={handleChange}
							required
						/>
						<div className="button-group">
							<button type="button" onClick={handlePrevStep}>Back</button>
							<button type="submit">Create Account</button>
						</div>
					</form>
				)}
				
				{message && <p className="message">{message}</p>}
				<p className="login-link">
					Already have an account? <button onClick={() => navigate('/')}>Log In</button>
				</p>
			</div>
		</div>
	);
}

export default CreateUser;
