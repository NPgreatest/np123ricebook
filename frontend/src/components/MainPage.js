import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../config'; // Adjust the path as needed

import '../styles/mainPage.css';

// Helper function to get a random image from assets folder
const getRandomImage = () => {
    const randomNumber = Math.floor(Math.random() * 100) + 1; // Random number between 1 and 100
    return null; // Dynamically import the image
};

const getImage = (number) => {
    try {
        return null;
    } catch (err) {
        console.error('Error loading image:', err,number);
        return null; 
    }
};

const MainPage = () => {
    const [articles, setArticles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newArticleText, setNewArticleText] = useState('');
    const [currentUserName, setCurrentUserName] = useState('');
    const [pictureUrl, setPictureUrl] = useState('');
    const [statusHeadline, setStatusHeadline] = useState('Welcome to Rice Book!');
    const [newArticlePictures, setNewArticlePictures] = useState([]);
    const [followedUsers, setFollowedUsers] = useState(new Map());
    const [ps, setPs] = useState(10); // page size
    const [pn, setPn] = useState(1); // page number

    const navigate = useNavigate();

    // useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Profile
                const response = await fetch(`${API_BASE_URL}/profile`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setCurrentUserName(data.username);
                    setStatusHeadline(data.headline || 'Welcome to My Company!');
                    setPictureUrl(data.picture);
                } else {
                    console.error('Failed to fetch user data');
                    // navigate('/login'); // redirect to login if not authenticated
                }

                // Follow
                const followRes = await fetch(`${API_BASE_URL}/following`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setFollowedUsers(data.following);

                } else {
                    console.error('Failed to fetch user data');
                    // navigate('/login'); // redirect to login if not authenticated
                }


            } catch (error) {
                console.error('Error fetching user data:', error);
                // navigate('/login'); // redirect to login if error
            }
        };


    const handlePictureUpload = (event) => {
        const files = Array.from(event.target.files);
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewArticlePictures(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    
        

    const refreshPosts = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/articles?ps=${ps}&pn=${pn}`, {
                method: 'GET',
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setArticles(data['articles']);
            } else {
                console.error('Failed to fetch articles');
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
        }
    };


    const fetchFollowedUsers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/following`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();

            if (response.ok) {
                const followedUsernames = data.following; // array of usernames

                // Fetch profiles for each followed user
                const profilesPromises = followedUsernames.map(async (username) => {
                    const profileResponse = await fetch(`${API_BASE_URL}/profile/${username}`, {
                        method: 'GET',
                        credentials: 'include',
                    });
                    if (profileResponse.ok) {
                        const userProfile = await profileResponse.json();
                        return { username, profile: userProfile };
                    } else {
                        console.error('Failed to fetch profile for', username);
                        return { username, profile: null };
                    }
                });

                const profilesArray = await Promise.all(profilesPromises);

                // Create a Map from username to userProfile
                const followedUsersMap = new Map();
                profilesArray.forEach(({ username, profile }) => {
                    followedUsersMap.set(username, profile);
                });

                setFollowedUsers(followedUsersMap);
            } else {
                console.error('Failed to fetch followed users:', data.error);
            }
        } catch (error) {
            console.error('Error fetching followed users:', error);
        }
    };


    useEffect(() => {
        fetchUserData();
        fetchFollowedUsers();
    }, []);


    useEffect(() => {
        refreshPosts(); // Fetch posts whenever ps or pn changes
    }, [ps, pn]);

    const handleLogout = () => {
        // Optionally, make a call to logout endpoint
        // Clear any cookies or tokens
        navigate('/login');
    };

    const handleProfile = () => {
        navigate('/profile');
    };


    const handleUnfollow = async (userNameToUnfollow) => {
        if (!userNameToUnfollow) {
            alert('Error: User to unfollow is required');
            return;
        }
    
        try {
            // Make a DELETE request to unfollow the user
            const response = await fetch(`${API_BASE_URL}/following/${userNameToUnfollow}`, {
                method: 'DELETE',
                credentials: 'include',
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.error || 'Failed to unfollow user');
            }
    
            setFollowedUsers((prevFollowedUsers) => {
                const updatedFollowedUsers = new Map(prevFollowedUsers);
                updatedFollowedUsers.delete(userNameToUnfollow);
                return updatedFollowedUsers;
            });
    
            refreshPosts();
        } catch (error) {
            alert(`Error: ${error.message}`);
            console.error('Error unfollowing user:', error);
        }
    };
    
    

    const handleFollow = async (newUserName) => {
        if (newUserName) {
            const isAlreadyFollowed = followedUsers.has(newUserName);
            if (isAlreadyFollowed) {
                alert('Error: User is already followed');
                return;
            }
            if (newUserName === currentUserName) {
                alert('Error: Cannot follow yourself');
                return;
            }
            try {
                // Make a PUT request to follow the new user
                const response = await fetch(`${API_BASE_URL}/following/${newUserName}`, {
                    method: 'PUT',
                    credentials: 'include',
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to follow user');
                }

                // Fetch the profile of the new user to get their details
                const profileResponse = await fetch(`${API_BASE_URL}/profile/${newUserName}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const userProfile = await profileResponse.json();

                if (!profileResponse.ok) {
                    throw new Error(userProfile.error || 'Failed to fetch user profile');
                }

                // Update the followedUsers state with the new user
                setFollowedUsers((prevFollowedUsers) => {
                    const updatedFollowedUsers = new Map(prevFollowedUsers);
                    updatedFollowedUsers.set(newUserName, userProfile);
                    return updatedFollowedUsers;
                });
                refreshPosts();
            } catch (error) {
                alert(`Error: ${error.message}`);
                console.error('Error following user:', error);
            }
        }
    };
    
    

    const handlePostArticle = async () => {
        if (!newArticleText) return;
        try {
            const response = await fetch(`${API_BASE_URL}/articles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    text: newArticleText,
                    picture: newArticlePictures,
                }),
            });
            if (response.ok) {
                const newArticle = await response.json();
                setArticles([newArticle, ...articles]);
                setNewArticleText('');
                setNewArticlePictures([]); // Clear pictures after posting
            } else {
                console.error('Failed to post article');
            }
        } catch (error) {
            console.error('Error posting article:', error);
        }
    };
    

    const handleCancelArticle = () => {
        setNewArticleText('');
        setNewArticlePictures([]);
    };
    

    const handleUpdateStatus = async () => {
        const newStatus = prompt('Update status headline:', statusHeadline);
        if (newStatus && newStatus !== statusHeadline) {
            try {
                const response = await fetch(`${API_BASE_URL}/profile/headline`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        headline: newStatus,
                    }),
                });
                if (response.ok) {
                    fetchUserData();
                } else {
                    console.error('Failed to update status');
                }
            } catch (error) {
                console.error('Error updating status:', error);
            }
        }
    };

    const filteredArticles = Array.isArray(articles)
    ? articles.filter((article) => {
          if (!article || typeof article !== 'object') return false;
          
          const textMatch = article.text 
              ? article.text.toLowerCase().includes(searchTerm.toLowerCase())
              : false;
              
          const authorMatch = article.author 
              ? article.author.toLowerCase().includes(searchTerm.toLowerCase())
              : false;
              
          return textMatch || authorMatch;
      })
    : [];


    return (
        <div className="main-container">
            <div className="header">
                <h1>Main Page</h1>
                <div className="user-profile">
                    <img src={pictureUrl} alt="Profile photo" />
                    <div>
                        <p>Username: {currentUserName}</p>
                        <p>Status: {statusHeadline}</p>
                        <button onClick={handleUpdateStatus}>
                            Update Status
                        </button>
                    </div>
                </div>
                <div>
                    <button className="logout-button" onClick={handleLogout}>Log Out</button>
                    <button className="profile-button" onClick={handleProfile}>Profile Page</button>
                </div>
            </div>

            <div className="content-wrapper">
                <div className="articles-section">
                <div className="new-article">
                    <textarea
                        value={newArticleText}
                        onChange={(e) => setNewArticleText(e.target.value)}
                        placeholder="Write a new article..."
                    />
                    <div className="picture-preview">
                        {newArticlePictures.map((pic, index) => (
                            <div key={index} className="picture-preview-item">
                                <img src={pic} alt={`Preview ${index}`} />
                                <button onClick={() => setNewArticlePictures(prev => 
                                    prev.filter((_, i) => i !== index))}>
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className='post-actions'>
                        <button onClick={handlePostArticle}>Post</button>
                        <button onClick={handleCancelArticle}>Clear</button>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePictureUpload}
                        />
                    </div>
                </div>


                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="articles-list">
                        {filteredArticles.map((article) => (
                            <div className="article" role="article" key={article._id}>
                                <div className="article-content">
                                    <div className="article-text">
                                        <h2>{article.author}</h2>
                                        <p>{article.text}</p>
                                        <p>Posted on: {new Date(article.createdAt).toLocaleString()}</p>
                                        {article.picture && article.picture.length > 0 && (
                                        <div className="article-pictures">
                                            {article.picture.map((pic, index) => (
                                                <img 
                                                    key={index}
                                                    src={pic} 
                                                    alt={`Article ${index}`} 
                                                    className="article-image"
                                                />
                                            ))}
                                        </div>
                                    )}
                                    </div>
                                </div>

                                <div className="article-actions">
                                    {/* Implement Comment and Edit functionality if needed */}
                                    <button>Comment</button>
                                    <button>Edit</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pagination-controls">
                        <label>
                            Page Size (ps):
                            <input
                                type="number"
                                min="1"
                                value={ps}
                                onChange={(e) => setPs(Number(e.target.value))}
                            />
                        </label>
                        <label>
                            Page Number (pn):
                            <input
                                type="number"
                                min="1"
                                value={pn}
                                onChange={(e) => setPn(Number(e.target.value))}
                            />
                        </label>
                    </div>

                    <div className="pagination-buttons">
                        <button onClick={() => setPn((prev) => Math.max(prev - 1, 1))}>Previous Page</button>
                        <button onClick={() => setPn((prev) => prev + 1)}>Next Page</button>
                    </div>

                </div>


                <div className="sidebar">
                    <h3>Followed Users</h3>
                    {Array.from(followedUsers.values()).map((user) => (
                        user && (
                            <div className="followed-user" key={user.username}>
                                <img src={user.picture} alt={user.displayName || user.username} />
                                {/* <img src={user.avatar || 'default-avatar.png'} alt={user.displayName || user.username} /> */}
                                <div>
                                    <p>{user.username}</p>
                                    <p>{user.headline}</p>
                                    <button onClick={() => handleUnfollow(user.username)}>Unfollow</button>
                                </div>
                            </div>
                        )
                    ))}


                    <div className="follow-new-user" style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Add a user to follow..."
                            id="followInput"
                            style={{ marginRight: '10px' }}
                        />
                        <button
                            onClick={() => {
                                const input = document.getElementById('followInput');
                                handleFollow(input.value);
                                input.value = '';
                            }}>
                            Follow
                        </button>
                    </div>

                </div>



            </div>
        </div>
    );
};

export default MainPage;
