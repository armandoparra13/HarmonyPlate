import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useAuth } from '../../Auth';
import { useNavigate } from 'react-router-dom';
import './UploadPictures.css'

function UploadPictures({ setUserData, setLoadingUserData }) {
  const { currentUser } = useAuth();
  const [selectedImage1, setSelectedImage1] = useState(null);
  const [selectedImage2, setSelectedImage2] = useState(null);
  const [selectedImage3, setSelectedImage3] = useState(null);
  const navigate = useNavigate();
  let [description, setDescription] = useState('');
  const [uploadedPicturesCount, setUploadedPicturesCount] = useState(0); 
  const [uploading1, setUploading1] = useState(false);
  const [uploading2, setUploading2] = useState(false);
  const [uploading3, setUploading3] = useState(false);
  const [imagePlaceholders, setImagePlaceholders] = useState([]);

  useEffect(() => {
    // Fetch initial value for uploadedPicturesCount when the component mounts
    fetchUserData();
  }, [uploading1, uploading2, uploading3]);

  

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


  const handleImageChange1 = (event) => {
    setSelectedImage1(event.target.files[0]);
  };

  const handleImageChange2 = (event) => {
    setSelectedImage2(event.target.files[0]);
  };
  const handleImageChange3 = (event) => {
    setSelectedImage2(event.target.files[0]);
  };

  const handleImageUpload1 = async () => {
    console.log("handleImageUpload1 clicked");

    if (!selectedImage1 || !currentUser) {
      return;
    }
    console.log("handleImageUpload1 clicked");
  
    console.log('yuh');
    setUploading1(true);
    const formData = new FormData();
    formData.append('image', selectedImage1);
  

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
      setUploading1(false);
    }
  };

  const handleImageUpload2 = async () => {


    if (!selectedImage2 || !currentUser) {
      return;
    }
   
    setUploading2(true);
    const formData = new FormData();
    formData.append('image', selectedImage2);
  

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
      setUploading2(false);
    }
  };

  const handleImageUpload3 = async () => {


    if (!selectedImage3 || !currentUser) {
      return;
    }
   
    setUploading3(true);
    const formData = new FormData();
    formData.append('image', selectedImage3);
  

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
      setUploading3(false);
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
    <div className="pictures-container">
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
      <input type="file" accept="image/*" onChange={handleImageChange1} />
      <button onClick={handleImageUpload1} disabled={ uploadedPicturesCount >= 3}>Upload Image 1</button>
      <input type="file" accept="image/*" onChange={handleImageChange2} />
      <button onClick={handleImageUpload2} disabled={uploadedPicturesCount >= 3}>Upload Image 2</button>
      <input type="file" accept="image/*" onChange={handleImageChange3} />
      <button onClick={handleImageUpload3} disabled={uploadedPicturesCount >= 3}>Upload Image 3</button>
      <p>Please upload at least 3 pictures to continue.</p>
      <button onClick={handleNextClick} disabled={(uploadedPicturesCount < 3)}>Next</button>
    </div>
  );
}

export default UploadPictures;