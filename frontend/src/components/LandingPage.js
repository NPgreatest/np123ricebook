import React, { useState,useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';

import '../styles/landingPage.css';

const LandingPage = () => {
    const [userdata, setUserData] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetch('https://jsonplaceholder.typicode.com/users')
            .then((response) => response.json())
            .then((data) => setUserData(data));
    }, []);


    const handleLogin = (e) => {
        e.preventDefault();
    
        for(let user of userdata){
            if (user.username === username && password === user.address.street){
                // Set a cookie with the userId
                Cookies.set('userId', user.id, { expires: 1 });
                navigate('/main');
                return; 
            }
        }
    
        setError('Invalid username or password');
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