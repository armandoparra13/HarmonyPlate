import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SpotifySuccessPage({ }) {
  const navigate = useNavigate();

  const handleNextClick = () => {
    // Navigate to a different page 
    navigate("/matching");
  };

  return (
    <div className="spotify-success">
      <h1 className="spotify-header">Spotify Login Success!</h1>
      <p className="spotify-success-text">Your Spotify login was successful.</p>
      <button className="spotify-button" onClick={handleNextClick}>Next</button>

    </div>
  );
}

export default SpotifySuccessPage;
