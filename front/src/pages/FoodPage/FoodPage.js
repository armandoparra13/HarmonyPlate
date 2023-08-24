import React, { useState } from 'react';
import "./FoodPage.css"
import { useAuth } from '../../contexts/Auth';
import axios from 'axios';

function FoodPage() {
    const { currentUser } = useAuth();
    const [keyword, setKeyword] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [diet, setDiet] = useState('');
    const [validSearch, setValidSearch] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [options, setOptions] = useState([]);
    const [optionChosen, setOptionChosen] = useState('');

    const onSubmit = (e) => {
        e.preventDefault();
        setOptionChosen([]);

        fetch(`/search?query=${keyword}&cuisine=${cuisine}&diet=${diet}`)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                if (data.error) {
                    setValidSearch(true);
                    setErrorMessage(data.error);
                } else {
                    setValidSearch(true);
                    setErrorMessage('');
                    setOptions(data.options);
                    console.log(options);
                }
            })
            .catch((error) => {
                console.error('Error sending data to backend:', error);
            });
    }

    const onChoose = (e) => {
        const previouslySelected = document.querySelector('.selected-option');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected-option');
        }
        e.target.classList.add('selected-option');
        setOptionChosen(e.target.id);

    }

    console.log(currentUser.accessToken)

    const submitChoice = (e) => {
        if (options.length === 0 || optionChosen) {
            console.log(optionChosen);
            axios.post('/foodChoice',
                { chosenFood: optionChosen },
                {
                    headers: {
                        authorization: currentUser.accessToken,
                    },
                })
        }

    }

    return (
        <div className="food-page">
            <div className="input-group">
                <label>Keyword:</label>
                <input
                    className="custom-input"
                    id="keyword"
                    type="text"
                    name="keyword"
                    onChange={(e) => (
                        setKeyword(e.target.value)
                    )}
                />
            </div>
            <div className="input-group">
                <label>Cuisine:</label>
                <select
                    className="custom-select"
                    name="cuisine"
                    onClick={(e) => (
                        setCuisine(e.target.value)
                    )}
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
            <div className="input-group">
                <label>Diet:</label>
                <select
                    className="custom-select"
                    name="diet"
                    onClick={(e) => (
                        setDiet(e.target.value))}
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
            <button className="input-group-button" onClick={onSubmit}>Search</button>
            <div className="options">
                {!validSearch ? (
                    <div>{errorMessage}</div>
                ) : options.length === 0 ? (<div>No options found. Change choices or finish.</div>) : (
                    <>
                        <div>Which one sounds the best to you</div>
                        {options.map((data, i) => (
                            <button className="option" id={data.id} key={i} name={data.title} onClick={onChoose}>
                                <div>{data.title}</div>
                                <img className="food-img" src={data.image}></img>
                            </button>
                        ))}
                    </>
                )}
            </div>

            {validSearch && <button className="input-group-button" onClick={submitChoice}>Finish</button>}
        </div >
    );
}
export default FoodPage;