import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../styles/profilePage.css';
import { API_BASE_URL } from '../config'; // Adjust the path as needed


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
    const [file, setFile] = useState(null); // For handling profile picture upload

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/profile`, {
                    method: 'GET',
                    credentials: 'include',
                });
    
                if (response.ok) {
                    const data = await response.json();
    
                    // Map the API response to your state structure
                    setProfileData({
                        username: data.username || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        zipcode: data.zipcode || '',
                        profilePicture: data.picture || null,
                        status: data.status || '',
                        headline: data.headline || '',
                    });
                } else {
                    console.error('Failed to fetch user data');
                    navigate('/login'); // Redirect to login on failure
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                navigate('/login'); // Redirect to login if there's an error
            }
        };
    
        fetchProfileData();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
    };


    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpdateProfile = async () => {
        const updatedData = {
            email: profileData.email,
            phone: profileData.phone,
            zipcode: profileData.zipcode,
            password: profileData.password || undefined,
            picture: null//file ? await convertFileToBase64(file) : profileData.profilePicture, // Use base64 if uploading files
        };
    
        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });
    
            if (response.ok) {
                const updatedProfile = await response.json();
                setProfileData((prev) => ({
                    ...prev,
                    profilePicture: updatedProfile.picture || prev.profilePicture,
                }));
                alert('Profile updated successfully');
            } else {
                console.error('Failed to update profile');
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('An error occurred while updating the profile');
        }
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
                <input type="file" id="uploadPicture" className="upload-button" onChange={handleFileChange} />
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
