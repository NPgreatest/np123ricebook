import React, { useState,useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../config'; // Adjust the path as needed

import '../styles/landingPage.css';

const LandingPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include', // Include cookies in the request
            });

            if (!response.ok) {
                const { error } = await response.json();
                setError(error || 'Login failed');
                return;
            }

            const data = await response.json();
            Cookies.set('username', data.username, { expires: 1 }); // Store username in a cookie (optional)
            navigate('/main');
        } catch (err) {
            setError('An error occurred during login. Please try again.');
        }
    };

    return (
        <div className="landing-container">
            <div className="landing-box">
                <h1>Welcome to Rice Book</h1>
                <form onSubmit={handleLogin}>
                    <div className="input-field">
                        <label htmlFor="username">Account Name</label>
                        <input 
                            type="text" 
                            id="username" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="input-field">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="login-button">Log In</button>
                </form>
                <Link to="/register" className="register-link">Register a New Account</Link>
            </div>
        </div>
    );
};

export default LandingPage;