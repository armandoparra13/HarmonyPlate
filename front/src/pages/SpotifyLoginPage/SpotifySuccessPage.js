import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SpotifySuccessPage({}) {
  //const navigate = useNavigate();
  //const accessToken = useAuth(code);
  //console.log(token);

  const handleNextClick = () => {
    // Navigate to a different page 
    //navigate("/");
  };

  return (
    <div>
      <h1>Spotify Login Success!</h1>
      <p>Your Spotify login was successful.</p>
      <button onClick={handleNextClick}>Next</button>
      
    </div>
  );
}

export default SpotifySuccessPage;

