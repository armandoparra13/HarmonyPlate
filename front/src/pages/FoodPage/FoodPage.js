import React, { useState, useEffect } from 'react';

function FoodPage () {
    const [keyword, setKeyword] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [diet, setDiet] = useState('');
    const [backendData, setBackendData] = useState([{}]);
    useEffect(() => {
        fetch('/search')
          .then((response) => {
            response.json();
          })
          .then((data) => {
            setBackendData(data);
          });
    }, []);

    const onSubmit = (e) => {
        e.preventDefault();
    
        const searchData = {
            keyword,
            cuisine,
            diet,
        };
    
        fetch('/search', {
            method: 'POST', // Assuming you want to use POST to send data to the backend
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchData),
        })
        .then((response) => response.json())
        .then((data) => {
            // Handle the response from the backend, if needed
            // For example, you can update the state with the fetched data
            setBackendData(data);
        })
        .catch((error) => {
            console.error('Error sending data to backend:', error);
        });
    }
    

    return (
        <div>
            <div>
                <label for="keyword">Keyword:</label>
                <input 
                    id="keyword" 
                    type="text" 
                    name="keyword" 
                    onChange={(e) => (
                        setKeyword(e.target.value), 
                        console.log(e.target.value))}
                />
            </div>
            <div>
                <label for="cuisine">Cuisine:</label>
                <select 
                    id="cuisine" 
                    name="cuisine" 
                    onClick={(e) => (
                        setCuisine(e.target.value),
                        console.log(e.target.value))}
                >
                    <option value="">Choose a cuisine ...</option>
                    <option value="african">African</option>
                    <option value="asian">Asian</option>
                    <option value="american">American</option>
                    <option value="british">British</option>
                    <option value="cajun">Cajun</option>
                    <option value="caribbean">Caribbean</option>
                    <option value="chinese">Chinese</option>
                    <option value="easternEuropean">Eastern European</option>
                    <option value="european">European</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="greek">Greek</option>
                    <option value="indian">Indian</option>
                    <option value="irish">Irish</option>
                    <option value="italian">Italian</option>
                    <option value="japanese">Japanese</option>
                    <option value="jewish">Jewish</option>
                    <option value="korean">Korean</option>
                    <option value="latinAmerican">Latin American</option>
                    <option value="mediterranean">Mediterranean</option>
                    <option value="mexican">Mexican</option>
                    <option value="middleEastern">Middle Eastern</option>
                    <option value="nordic">Nordic</option>
                    <option value="southern">Southern</option>
                    <option value="spanish">Spanish</option>
                    <option value="thai">Thai</option>
                    <option value="vietnamese">Vietnamese</option>
                </select>
            </div>
            <div>
                <label for="diet">Diet:</label>
                <select 
                    id="diet" 
                    name="diet" 
                    onClick={(e) => (
                    setDiet(e.target.value),
                    console.log(e.target.value))}
                >
                    <option value="">Choose a diet ...</option>
                    <option value="glutenFree">Gluten Free</option>
                    <option value="ketogenic">Ketogenic</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="lactoVegetarian">Lecto-Vegetarian</option>
                    <option value="ovoVegetarian">Ovo-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="pescetarian">Pescetarian</option>
                    <option value="paleo">Paleo</option>
                    <option value="primal">Primal</option>
                    <option value="lowFodmap">Low FODMAP</option>
                    <option value="whole30">Whole30</option>
                </select>
            </div>
            <button id="submit" onClick={onSubmit}>Next</button>
        </div>
    );
}
export default FoodPage;