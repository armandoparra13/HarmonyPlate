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
  const [loadingUserData, setLoadingUserData] = useState(true);
 

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
        finally {
          setLoadingUserData(false);
        }
      }
    }

    fetchUserData();
  }, [currentUser]);


  if (loadingUserData && currentUser) {
    // Loading component when data is not available yet
    return <LoadingComponent />;
  }
  

  const { picturesUploaded, spotifyLinked, foodsChosen } = userData || {};

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
              <Route 
                path="/*"
                element={
                  <Navigate to="/" />
                }
              />
            </>
          ) : (
            // Private routes
            <>
            

              <Route 
                path="/food" 
                element={
                  spotifyLinked && picturesUploaded && foodsChosen ? (
                    <Navigate to="/create-profile" />
                  ) : (
                    <FoodPage setUserData={setUserData}
                    setLoadingUserData={setLoadingUserData}/>

                  )
                }
              />

              <Route 
                path="/spotify-login" 
                element={
                  spotifyLinked && picturesUploaded && foodsChosen ? (
                    <Navigate to="/create-profile" />
                  ) : (
                    <SpotifyLoginPage setUserData={setUserData}
                    setLoadingUserData={setLoadingUserData}/>
                  )
                  }
                />

              <Route 
                path="/upload-pictures" 
                element={
                  currentUser && loadingUserData ? (
                    <LoadingComponent />
                  ) : (
                    spotifyLinked && picturesUploaded && foodsChosen ? (
                      <Navigate to="/create-profile" />
                    ) : (
                      <UploadPictures setUserData={setUserData}
                      setLoadingUserData={setLoadingUserData}/>
                    )
                  )
                }
              />
              <Route 
                path="/create-profile" 
                element={
                  spotifyLinked && picturesUploaded && foodsChosen ? (
                    <CreateProfilePage />
                  ) : (
                    <>
                      {!foodsChosen && <Navigate to="/food" />}
                      {!spotifyLinked && <Navigate to="/spotify-login" />}
                      {!picturesUploaded && <Navigate to="/upload-pictures" />}
                    </>
                  )
                  }
                />
              <Route
                path="/SignUp"
                element={
                  spotifyLinked && picturesUploaded && foodsChosen ? (
                    <Navigate to="/create-profile" />
                  ) : (
                    <>
                      {!foodsChosen && <Navigate to="/food" />}
                      {!spotifyLinked && <Navigate to="/spotify-login" />}
                      {!picturesUploaded && <Navigate to="/upload-pictures" />}
                    </>
                  )
                }
              />
              
              <Route
                path="/"
                element={
                  spotifyLinked && picturesUploaded && foodsChosen ? (
                    <Navigate to="/matching" />
                  ) : (
                    <>
                      {!foodsChosen && <Navigate to="/food" />}
                      {!spotifyLinked && <Navigate to="/spotify-login" />}
                      {!picturesUploaded && <Navigate to="/upload-pictures" />}
                      
                    </>
                  )
                }
              />

              <Route
                path="/matching"
                element={
                  spotifyLinked && picturesUploaded && foodsChosen ? (
                    <MatchingPage />
                  ) : (
                    <>
                      {!foodsChosen && <Navigate to="/food" />}
                      {!spotifyLinked && <Navigate to="/spotify-login" />}
                      {!picturesUploaded && <Navigate to="/upload-pictures" />}
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





