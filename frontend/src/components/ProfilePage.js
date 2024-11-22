import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../styles/profilePage.css';

const getImage = (number) => {
    try {
        return require(`../assets/${number}.jpg`);
    } catch (err) {
        console.error('Error loading image:', err);
        return null; 
    }
};

const ProfilePage = () => {
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState({
        username: '', 
        email: '',
        phone: '',
        zipcode: '',
        password: '',
        profilePicture: null, 
    });

    useEffect(() => {
        const id_s = Cookies.get('userId');
        if (!id_s) {
            navigate('');
            return;
        } 
        if (id_s === 'new'){
            let userName = Cookies.get('username');
            let email = Cookies.get('email');
            let zipcode = Cookies.get('zipcode');
            let phone = Cookies.get('phone');
            setProfileData({username: userName, email:email,zipcode:zipcode,phone:phone});
            // profileData.username = userName;
            return;
        }
        const id = parseInt(id_s, 10);
        fetch(`https://jsonplaceholder.typicode.com/users`)
            .then((response) => response.json())
            .then((data) => {
                const user = data.find(item => item.id === id);
                const profilePicture = getImage(id_s); 

                setProfileData({
                    ...user, 
                    profilePicture: profilePicture || '/path/to/default.jpg' 
                });
            })
            .catch((error) => console.error('Error fetching users:', error));
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
    };

    const handleUpdateProfile = () => {
        alert('Profile updated successfully');
    };

    return (
        <div className="profile-container">
            <h1>Profile Page</h1>
            <div className="profile-picture-section">
                {profileData.profilePicture ? (
                    <img src={profileData.profilePicture} alt={profileData.username} className="profile-picture" />
                ) : (
                    <p>Loading profile picture...</p>
                )}
                <input type="file" id="uploadPicture" className="upload-button" />
            </div>

            <div className="profile-info">
                <label>
                    Username:
                    <input type="text" name="username" value={profileData.username} onChange={handleInputChange} disabled />
                </label>

                <label>
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                    />
                </label>

                <label>
                    Phone:
                    <input
                        type="text"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                    />
                </label>

                <label>
                    Zipcode:
                    <input
                        type="text"
                        name="zipcode"
                        value={profileData.zipcode}
                        onChange={handleInputChange}
                    />
                </label>

                <label>
                    Password:
                    <input
                        type="password"
                        name="password"
                        value={profileData.password}
                        onChange={handleInputChange}
                    />
                </label>

                <button className="update-button" onClick={handleUpdateProfile}>Update Profile</button>
                <button className="back-button" onClick={() => navigate('/main')}>Back to Main</button>
            </div>
        </div>
    );
};

export default ProfilePage;
