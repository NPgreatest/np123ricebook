import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import '../styles/mainPage.css';

// Helper function to get a random image from assets folder
const getRandomImage = () => {
    const randomNumber = Math.floor(Math.random() * 100) + 1; // Random number between 1 and 100
    return require(`../assets/${randomNumber}.jpg`); // Dynamically import the image
};

const getImage = (number) => {
    try {
        return require(`../assets/${number}.jpg`);
    } catch (err) {
        console.error('Error loading image:', err,number);
        return null; 
    }
};

const TotalUsers = 11;

const MainPage = () => {
    const [articles, setArticles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newArticleText, setNewArticleText] = useState('');
    const [currentId, setcurrentId] = useState('');
    const [currentUserName,setcurrentUserName] = useState('');
    const [statusHeadline, setStatusHeadline] = useState('Welcome to My Company!');
    const [followedUsers, setFollowedUsers] = useState([]);

    const navigate = useNavigate();

    const refreshPosts = (newIds) =>{
        fetch(`https://jsonplaceholder.typicode.com/posts`)
        .then((response) => response.json())
        .then((data) =>{
            var posts = data.filter(item =>newIds.includes(item.userId) );
            setArticles(posts);
        })
        .catch((error) => console.error('Error Fetching posts'));
    }

    
    useEffect(() => {
        const id_s = Cookies.get('userId');
        if (!id_s) {
            navigate('');
            return;
        } 
        if (id_s === 'new'){
            let userName = Cookies.get('username');
            setcurrentUserName(userName);
            return;
        }
        var id = parseInt(id_s, 10);
        setcurrentId(id);
        fetch(`https://jsonplaceholder.typicode.com/users`)
        .then((response) => response.json())
        .then((data) => {
          setFollowedUsers(data);
          setcurrentUserName(data.filter(item => item.id===id)[0].username)
          setStatusHeadline(data.filter(item => item.id===id)[0].company.catchPhrase)
          let newIds = [];
          for (let i = 1; i < 4; i++) {
            let newId = (id + i) % TotalUsers;
            newIds.push(newId);
          }
          const filteredUsers = data.filter(item => newIds.includes(item.id));
          filteredUsers.map(item => item.image = getImage(item.id));
          setFollowedUsers(filteredUsers);
          refreshPosts(newIds);

        })
        .catch((error) => console.error('Error fetching users:', error));


    }, []);

    const handleLogout = () => {
        navigate('/');
    };

    const handleProfile = () => {
        navigate('/profile')
    };

    const handlePostArticle = () => {
        const id_s = Cookies.get('userId');
        var id = parseInt(id_s, 10);
        const newArticle = {
            userId: id,
            id: articles.length + 1,
            title: 'New Article',
            body: newArticleText,
        };
        setArticles([newArticle, ...articles]);
        setNewArticleText('');
    };

    const handleCancelArticle = () => {
        setNewArticleText('');
    };

    const filteredArticles = articles.filter(
        (article) =>
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.body.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUnfollow = (userId) => {
        setFollowedUsers(prevFollowedUsers => {
            const updatedFollowedUsers = prevFollowedUsers.filter((user) => user.id !== userId);
            refreshPosts(updatedFollowedUsers.map(item => item.id)); 
            return updatedFollowedUsers;
        });
    };
    

    const handleFollow = (newUserName) => {
        if (newUserName) {
            const isAlreadyFollowed = followedUsers.some(user => user.username === newUserName);
            if (isAlreadyFollowed) {
                alert('Error: User is already followed');
                return;
            }
            if (newUserName === currentUserName) {
                alert('Error: Cannot follow myself');
                return;
            }
            fetch(`https://jsonplaceholder.typicode.com/users`)
                .then((response) => response.json())
                .then((data) => {
                    const newUser = data.find(item => item.username === newUserName);
                    if (newUser) {
                        newUser.image = getImage(newUser.id);
                        setFollowedUsers(prevFollowedUsers => [...prevFollowedUsers, newUser]);
                        refreshPosts([...followedUsers.map(user => user.id), newUser.id]);
                    }else{
                        alert('cannot find user');
                    }
                })
                .catch((error) => console.error('Error fetching users:', error));
        }
    };
    

    return (
        <div className="main-container">
            <div className="header">
                <h1>Main Page</h1>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div className="user-profile">
                {currentId ? (
                    <img src={getImage(currentId)} alt="User Profile" />
                ) : (
                    <p>Loading profile picture...</p>
                )}
                    <div>
                        <p>Username: {currentUserName}</p>
                        <p>Status: {statusHeadline}</p>
                        <button onClick={() => setStatusHeadline(prompt('Update status headline:', statusHeadline))}>
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
                        <div className='post-actions'>
                            <button onClick={handlePostArticle}>Post</button>
                            <button onClick={handleCancelArticle}>Clear</button>
                            <input type="file" id="avatar" name="avatar" accept="image/png, image/jpeg" />
                        </div>
                    </div>

                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <div className="articles-list">
                        {filteredArticles.map((article, index) => (
                            <div className="article" role="article" key={article.id}>
                                <div className="article-content">
                                    <img src={getImage(article.id)} alt="Article" className="article-avatar" />
                                    <div className="article-text">
                                        <h2>{article.title}</h2>
                                        <p>{article.body}</p>
                                    </div>
                                </div>
                                <div className="article-actions">
                                    <button>Comment</button>
                                    <button>Edit</button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

                <div className="sidebar">
                    <h3>Followed Users</h3>
                    {followedUsers.map((user) => (
                        <div className="followed-user" key={user.id}>
                            <img src={user.image} alt={user.name} />
                            <div>
                                <p>{user.username}</p>
                                <p>{user.name}</p>
                                <button onClick={() => handleUnfollow(user.id)}>Unfollow</button>
                            </div>
                        </div>
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
