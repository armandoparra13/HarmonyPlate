
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import { MatchingPage } from './pages/MatchingPage/MatchingPage';
import CreateProfilePage from './pages/ProfileCreationPage/CreateProfilePage';
import SignUp from './pages/SignUpPage/SignUpPage'
import FoodPage from './pages/FoodPage/FoodPage';
import SpotifyLoginPage from './pages/SpotifyLoginPage/SpotifyLoginPage';
import SpotifySuccessPage from './pages/SpotifyLoginPage/SpotifySuccessPage';
import UploadPictures from './pages/ProfileCreationPage/UploadPictures';
import UserProfilePage from './pages/UserProfilePage/UserProfilePage';

export const AppRoutes = () => {

  /*
    const [token, setToken] = useState('');

    useEffect(() => {

        async function getToken() {
            const response = await fetch('/auth/token');
            const json = await response.json();
            setToken(json.access_token);
            console.log('Token:', json.access_token);
        }

    getToken();

  }, []);
  */

  return (
    <div>
  
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        
        <Route path="/spotify-login" element={<SpotifyLoginPage />} />
        <Route path="/spotify-success" element={<SpotifySuccessPage />}/>
        <Route path="/upload-pictures" element={<UploadPictures />} />
    
        <Route path="/matching" element={<MatchingPage />} />
        <Route path="/create-profile" element={<CreateProfilePage />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/food" element={<FoodPage />} />

        <Route path="/user-profile" element={<UserProfilePage/>} />
      </Routes>
    </Router>
    </div>
  );
};
