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
    const [file, setFile] = useState(null);
    const [githubLinked, setGithubLinked] = useState(false);

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
                    // console.log(data);
                    setGithubLinked(data.auth?.some(a => a.provider === 'github') || false);

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
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

        // Add GitHub link/unlink handlers
        const handleGitHubLink = () => {
            window.location.href = `${API_BASE_URL}/auth/github/link`;
        };
    
        const handleGitHubUnlink = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/github/unlink`, {
                    method: 'GET',
                    credentials: 'include',
                });
    
                if (response.ok) {
                    setGithubLinked(false);
                    alert('GitHub account unlinked successfully');
                } else {
                    alert('Failed to unlink GitHub account');
                }
            } catch (error) {
                console.error('Error unlinking GitHub:', error);
                alert('An error occurred while unlinking GitHub account');
            }
        };

    const handleUpdateProfile = async () => {
        const formData = new FormData();
        
        // Only add fields that have values
        if (profileData.email) formData.append('email', profileData.email);
        if (profileData.phone) formData.append('phone', profileData.phone);
        if (profileData.zipcode) formData.append('zipcode', profileData.zipcode);
        if (profileData.password) formData.append('password', profileData.password);
        if (profileData.status) formData.append('status', profileData.status);
        if (profileData.headline) formData.append('headline', profileData.headline);
        
        // Add the file if one was selected
        if (file) {
            formData.append('picture', file);
        }
    
        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: 'PUT',
                credentials: 'include',
                // Don't set Content-Type header - let the browser set it with the boundary
                body: formData,
            });
    
            if (response.ok) {
                const updatedProfile = await response.json();
                setProfileData(prev => ({
                    ...prev,
                    profilePicture: updatedProfile.picture,
                    password: '', // Clear password field after successful update
                }));
                setFile(null); // Reset file input
                alert('Profile updated successfully');
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('An error occurred while updating the profile');
        }
    };
    


    return (
        <div className="profile-container">
            <h1>Profile Page</h1>
            <div className="github-section">
                <h2>GitHub Connection</h2>
                {githubLinked ? (
                    <div>
                        <p>GitHub account is linked</p>
                        <button 
                            className="github-button unlink"
                            onClick={handleGitHubUnlink}
                        >
                            Unlink GitHub Account
                        </button>
                    </div>
                ) : (
                    <button 
                        className="github-button link"
                        onClick={handleGitHubLink}
                    >
                        Link GitHub Account
                    </button>
                )}
            </div>
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
