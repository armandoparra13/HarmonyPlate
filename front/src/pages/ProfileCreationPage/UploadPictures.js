import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useAuth } from '../../contexts/Auth';
import { useNavigate } from 'react-router-dom';

function UploadPictures() {
  const { currentUser } = useAuth();
    const [selectedImage, setSelectedImage] = useState(null);
    const navigate = useNavigate();
    //const [images, setImages] = useState(Array(6).fill(null));
  
    const handleImageChange = (event) => {
        setSelectedImage(event.target.files[0]);
    };

    const handleImageUpload = async () => {
 

    if (!selectedImage || !currentUser) {
      return;
    }
    const formData = new FormData();
    formData.append('image', selectedImage);
    
    try {
      const response = await axios.post('/auth/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${currentUser.accessToken}`,
        },
      });
    
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };
      const handleNextClick = () => {
        // Navigate to a different page 
        navigate("/spotify-login");
      };

    return (
      <div>
        <h1>Upload profile pictures!</h1>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button onClick={handleImageUpload}>Upload Image</button>
        <p>Please upload at least 2 pictures to continue.</p>
        <button onClick={handleNextClick}>Next</button>
      </div>
    );
  }
  
  export default UploadPictures;