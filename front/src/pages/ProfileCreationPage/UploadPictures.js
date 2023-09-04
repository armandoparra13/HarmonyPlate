import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { useAuth } from '../../Auth';
import { useNavigate } from 'react-router-dom';
import './UploadPictures.css'

function UploadPictures({ setUserData, setLoadingUserData }) {
  const { currentUser } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  let [description, setDescription] = useState('');
  const [uploadedPicturesCount, setUploadedPicturesCount] = useState(0); 
  const [uploading, setUploading] = useState(false);

  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {

    //fetchUserData();
    fetchUserImages();
  }, [uploading]);



  const fetchUserImages = async () => {
    try {
      const response = await axios.get('/auth/fetch-user-images', {
        headers: {
          Authorization: `Bearer ${currentUser.accessToken}`,
        },
      });
      if (response.data) {
        setImageUrls(response.data.imageUrls);
        console.log(response.data.imageUrls);
      }
      
    } catch (error) {
      console.error('Error fetching user images:', error);
    }
  };



  const fetchUserData = async () => {
    if (currentUser) {
      try {
        const response = await axios.get('/auth/fetch-user-data', {
          headers: {
            Authorization: `Bearer ${currentUser.accessToken}`,
          },
        });
        if (response.data && typeof response.data.picturesUploaded === 'number') {
          // Set the picturesUploaded count in the state
          setUploadedPicturesCount(response.data.picturesUploaded);
          console.log(response.data.picturesUploaded);
          console.log(uploadedPicturesCount);
        }
        console.log(response.data);
        setUserData(response.data);

        
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
      finally {
        setLoadingUserData(false);
      }
    }
  };

  const handleDescChange = (event) => {
    console.log("FHJDSF");
    setDescription(event.target.value);
  }

  const handleDescSubmit = async (event) => {
    event.preventDefault();
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

  

  const handleImageUpload = async (e) => {


    //e.preventDefault(); 
    if (!selectedImage || !currentUser) {
      console.log('ok');
      console.log('selectedImage:', selectedImage);
      return;
    }
  

  
    console.log('yuh');
    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);
  

    try {
      const response = await axios.post('/auth/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${currentUser.accessToken}`,
        },
      });
      
      const updatedPicCount = response.data.picturesCount;
      

    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      fetchUserImages();
      fetchUserData();
    }
  };

  const handleDeleteImage = async (imageUrl) => {
  
    try {
      await axios.delete('/auth/delete-image', {
        headers: {
          Authorization: `Bearer ${currentUser.accessToken}`,
        },
        data: { imageUrl }, // Pass the URL of the image to be deleted
      });

      fetchUserImages();
      fetchUserData();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  const handleNextClick = () => {

    
    if (uploadedPicturesCount >= 3 ) {
      navigate("/spotify-login");
    } else {
      alert("Please upload at least 3 pictures.");
    }
  };

  return (
    <div className="pictures-creation-container">
      <div className="header">
        <h3 className="add-desc">Add a description about yourself:</h3>
        <h2 className="upload-pics-header">Upload profile pictures:</h2>
      </div>
        <div className="side-by-side">
        <div className="profile-description">
          <form onSubmit={handleDescSubmit}>
            <label>
            
              <textarea
                style={{ float:'left', width: '400px', height: '70px'}}
                value={description}
                onChange={handleDescChange}
                rows="4"
                cols="50"
                placeholder="Write something about yourself..."
              />
            </label>
            <button type="submit">Save Description</button>
          </form>
        </div>
      
      
      <div className="uploaded-images">
        <div className="upload-buttons">
        <input
          className="choose-button"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
    
        />
     
        <button type="button" onClick={handleImageUpload} >Upload Image</button>
        </div>
        <p>Please upload at least 3 pictures to continue.</p>
      </div>
      </div>
  
      <div>
        {imageUrls.map((imageUrl, index) => (
          <div key={index} className="image-container">
            <div className="image-wrapper">
            <img src={imageUrl} alt={`User Image ${index}`} className="images-displayed" />
            <button
              className="delete-button"
              onClick={() => handleDeleteImage(imageUrl)}
            >
              X
            </button>
          </div>
          </div>
        ))}
      </div>
      
      <button onClick={handleNextClick} disabled={(uploadedPicturesCount < 3)}>Next</button>
      
    </div>
  );
}

export default UploadPictures;