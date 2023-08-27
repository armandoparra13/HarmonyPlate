import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useAuth } from '../../Auth';
import { useNavigate } from 'react-router-dom';

function UploadPictures() {
  const { currentUser } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();
  let [description, setDescription] = useState('');
  

  const handleDescChange = (event) => {
    setDescription(event.target.value);
  }

  const handleDescSubmit = async (event) => {
    try {
      const response = await axios.post(
        '/auth/submit-desc',
        { desc: description },
        {
          headers: {
            authorization: currentUser.accessToken,
          },
        }
      );
  
      console.log('Response from server:', response.data);
    } catch (error) {
      console.error('Error while submitting description:', error.message);
    }
  }


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
        <div>
          <h2>Add a description about yourself:</h2>
          <form onSubmit={handleDescSubmit}>
            <label>
              Profile Description:
              <textarea
                value={description}
                onChange={handleDescChange}
                rows="4"
                cols="50"
              />
            </label>
            <button type="submit">Save Description</button>
          </form>
        </div>
        <h2>Upload profile pictures!</h2>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button onClick={handleImageUpload}>Upload Image</button>
        <p>Please upload at least 2 pictures to continue.</p>
        <button onClick={handleNextClick}>Next</button>
      </div>
    );
  }
  
  export default UploadPictures;