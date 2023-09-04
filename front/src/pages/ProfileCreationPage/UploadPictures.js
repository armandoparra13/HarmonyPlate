import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useAuth } from '../../Auth';
import { useNavigate } from 'react-router-dom';
import './UploadPictures.css'

function UploadPictures({ setUserData, setLoadingUserData }) {
  const { currentUser } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImage2, setSelectedImage2] = useState(null);
  const [selectedImage3, setSelectedImage3] = useState(null);
  const navigate = useNavigate();
  let [description, setDescription] = useState('');
  const [uploadedPicturesCount, setUploadedPicturesCount] = useState(0); 
  const [uploading, setUploading] = useState(false);
  const [uploading2, setUploading2] = useState(false);
  const [uploading3, setUploading3] = useState(false);
  const [imagePlaceholders, setImagePlaceholders] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {
    // Fetch initial value for uploadedPicturesCount when the component mounts
    fetchUserData();
    //fetchUserImages();
  }, [uploading]);


/*
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

*/

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



  const handleImageUpload = async () => {
    console.log("handleImageUpload1 clicked");

    if (!selectedImage || !currentUser) {
      return;
    }
    console.log("handleImageUpload1 clicked");
  
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
      fetchUserData();


    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

 

  const handleNextClick = () => {
    // Navigate to a different page 
    
    if (uploadedPicturesCount >= 3 ) {
      navigate("/spotify-login");
    } else {
      alert("Please upload at least 3 pictures.");
    }
  };

  return (
    <div className="pictures-creation-container">
      
        <h2>Add a description about yourself:</h2>
        <div className="profile-description">
        <form onSubmit={handleDescSubmit}>
          <label>
            
            <textarea
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
      <h2>Upload profile pictures!</h2>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleImageUpload} >Upload Images</button>

      <p>Please upload at least 3 pictures to continue.</p>
      </div>
      <button onClick={handleNextClick} disabled={(uploadedPicturesCount < 3)}>Next</button>
      
    </div>
  );
}

export default UploadPictures;