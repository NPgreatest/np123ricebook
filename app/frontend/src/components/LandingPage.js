import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../config';
import '../styles/landingPage.css';
import backgroundImage from '../assets/login_back.webp'; // Make sure to add the image to your assets folder


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
                credentials: 'include',
            });

            if (!response.ok) {
                const { error } = await response.json();
                setError(error || 'Login failed');
                return;
            }

            const data = await response.json();
            Cookies.set('username', data.username, { expires: 1 });
            navigate('/main');
        } catch (err) {
            setError('An error occurred during login. Please try again.');
        }
    };

    // Add GitHub login handler
    const handleGitHubLogin = () => {
        window.location.href = `${API_BASE_URL}/auth/github`;
    };

    return (
        <div className="landing-container">
            <div className="background-overlay"></div>
            <div className="landing-box">
                <div className="logo-area">
                    <h1>Welcome to Rice Book</h1>
                    <p className="tagline">Connect with friends and the world around you.</p>
                </div>
                
                <div className="social-login">
                    <button 
                        type="button" 
                        className="github-button"
                        onClick={handleGitHubLogin}
                    >
                        <i className="fab fa-github"></i>
                        Continue with GitHub
                    </button>
                    <p className="github-notice" style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
                        To use GitHub login, first register a new user with password, then link your GitHub profile in the profile page
                    </p>
                </div>
    
                <div className="separator">
                    <span>or</span>
                </div>

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
