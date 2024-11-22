import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import MainPage from './components/MainPage';
import ProfilePage from './components/ProfilePage';
import RegisterPage from './components/RegisterPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default App;
