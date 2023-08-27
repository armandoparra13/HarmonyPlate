import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import { MatchingPage } from './pages/MatchingPage/MatchingPage';
import CreateProfilePage from './pages/ProfileCreationPage/CreateProfilePage';
import SignUp from './pages/SignUpPage/SignUpPage';
import FoodPage from './pages/FoodPage/FoodPage';
import SpotifyLoginPage from './pages/SpotifyLoginPage/SpotifyLoginPage';
import SpotifySuccessPage from './pages/SpotifyLoginPage/SpotifySuccessPage';
import UploadPictures from './pages/ProfileCreationPage/UploadPictures';
import { useAuth } from './Auth';
import axios from 'axios';


const LoadingComponent = () => {
  return <div>Loading...</div>; 
};

export const AppRoutes = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);


  useEffect(() => {
    async function fetchUserData() {
      if (currentUser) {
        try {
          const response = await axios.get('/auth/fetch-user-data', {
            headers: {
              Authorization: `Bearer ${currentUser.accessToken}`,
            },
          });
          console.log(response.data);
          setUserData(response.data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    }

    fetchUserData();
  }, [currentUser]);

  if (!currentUser || userData === null) {
    // loading component when data is not available yet
    return <LoadingComponent />;
  }

  const { picturesUploaded, spotifyLinked, foodChosen } = userData;

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/spotify-success" element={<SpotifySuccessPage />} />
          
          {/* Public routes */}
          {!currentUser ? (
            <>
              <Route path="/" element={<LoginPage />} />
              <Route path="/SignUp" element={<SignUp />} />
            </>
          ) : (
            // Private routes
            <>
              <Route path="/upload-pictures" element={<UploadPictures />} />
              <Route path="/spotify-login" element={<SpotifyLoginPage />} />
              <Route path="/food" element={<FoodPage />} />
              <Route
                path="/SignUp"
                element={
                  spotifyLinked && picturesUploaded && foodChosen ? (
                    <Navigate to="/matching" />
                  ) : (
                    <>
                      {!picturesUploaded && <Navigate to="/upload-pictures" />}
                      {!spotifyLinked && <Navigate to="/spotify-login" />}
                      {!foodChosen && <Navigate to="/food" />}
                    </>
                  )
                }
              />
              
              <Route
                path="/"
                element={
                  spotifyLinked && picturesUploaded && foodChosen ? (
                    <Navigate to="/matching" />
                  ) : (
                    <>
                      {!picturesUploaded && <Navigate to="/upload-pictures" />}
                      {!spotifyLinked && <Navigate to="/spotify-login" />}
                      {!foodChosen && <Navigate to="/food" />}
                    </>
                  )
                }
              />

              <Route
                path="/matching"
                element={
                  spotifyLinked && picturesUploaded && foodChosen ? (
                    <MatchingPage />
                  ) : (
                    <>
                      {!picturesUploaded && <Navigate to="/upload-pictures" />}
                      {!spotifyLinked && <Navigate to="/spotify-login" />}
                      {!foodChosen && <Navigate to="/food" />}
                    </>
                  )
                }
              />
              

            </>
          )}
        </Routes>
      </Router>
    </div>
  );
};





