import React, { useState, useEffect } from "react";
import axios from 'axios';

function UploadPictures() {
    const [selectedImage, setSelectedImage] = useState(null);
    //const [images, setImages] = useState(Array(6).fill(null));
  
    const handleImageChange = (event) => {
        setSelectedImage(event.target.files[0]);
    };

    const handleImageUpload = async () => {
        const formData = new FormData();
        formData.append('image', selectedImage);
    
        try {
          const response = await axios.post('/auth/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
    
          console.log(response.data);
        } catch (error) {
          console.error(error);
        }
      };

    return (
      <div>
        <h1>Upload profile pictures!</h1>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button onClick={handleImageUpload}>Upload Image</button>
        <p>Please upload at least 2 pictures to continue.</p>
      </div>
    );
  }
  
  export default UploadPictures;