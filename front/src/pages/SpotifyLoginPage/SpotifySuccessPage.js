import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SpotifySuccessPage({ }) {
  const navigate = useNavigate();

  const handleNextClick = () => {
    // Navigate to a different page 
    navigate("/matching");
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
