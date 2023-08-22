import express from 'express';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from "firebase/database";
import firebaseConfig from './env_backend.json' assert { type: 'json' };
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import axios from 'axios';
import env from './env.json' assert {type: 'json'};

const app = express();
app.use(express.json());

// Initialize Firebase, Realtime Database, Authentication
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);
const auth = getAuth();

const port = 5000;
const hostname = "localhost";

app.post("/signup", (req, res) => {
  // verify input is valid
  let body = req.body;
  console.log(body);

  if (
    !body.hasOwnProperty("username") ||
    !body.hasOwnProperty("email") ||
    !body.hasOwnProperty("password") ||
    !body.hasOwnProperty("gender") ||
    !body.hasOwnProperty("dateOfBirth") ||
    body.gender.trim() === "" ||
    body.dateOfBirth.trim() === "" ||
    body.username.trim() === "" ||
    body.email.trim() === "" ||
    body.password.trim() === ""
  ) {
    return res.status(400).send("Invalid request.");
  }

  // add user to Authentication (used for login)
  //example of an acceptable json: {"username": "theGuy", "email": "abc@gmail.com", "password": "123456"}
  createUserWithEmailAndPassword(auth, body.email, body.password)
    .then((userCredential) => {
      // Signed in 
      //add user to Realtime Database (used to store user data other than login info)
      let user = userCredential.user;
      set(ref(database, 'users/' + user.uid), {
        username: body.username,
        email: body.email,
        dateOfBirth: body.dateOfBirth,
        gender: body.gender,
        spotifyLinked: false
      }).then(() => {
        return res.send("User creation successful");
      }).catch(() => {
        console.log("Adding user to Database failure");
        return res.status(500).send("Adding user to Database failure");
      })

    })
    .catch(() => {
      console.log("User authentication creation failure");
      return res.status(500).send("User authentication creation failure");
    });
});

let spoonacularUrl = env["spoonacular_url"];
let spoonacularApi = env["spoonacular_key"];

app.get("/", (req, res) => {
  res.send("HarmonyPlate API")
})

app.get("/api", (req, res) => {
  res.json({ "users": ["userOne", "userTwo"] })
})

app.get("/search", (req, res) => {
  let query = req.query.query;
  let cuisine = req.query.cuisine;
  let diet = req.query.diet;

  console.log(req.query);

  if (!query) {
    return res.status(400).send({ "error": "Invalid Query" });
  }

  if (!cuisine) {
    return res.status(400).send({ "error": "No cuisine chosen" });
  }
  let url = `${spoonacularUrl}recipes/complexSearch?query=${query}&cuisine=${cuisine}${diet ? '&diet=' + diet : ''}&apiKey=${spoonacularApi}`
  axios.get(url).then(response => {
    console.log(url)
    return res.status(200).send({ "options": response.data.results });
  })
})

app.post("/foodChoice", (req, res) => {
  // verify input is valid
  let body = req.body;

  if (
    !body.hasOwnProperty("chosenFood") ||
    body.chosenFood.trim() === ""
  ) {
    return res.status(400).send("Invalid request.");
  }

  console.log(body.chosenFood)
  /*let user = userCredential.user;
  set(ref(database, 'users/' + user.uid), {
    username: body.username,
    email: body.email,
    spotifyLinked: false
  }).then(() => {
    return res.send("User creation successful");
  }).catch(() => {
    console.log("Adding user to Database failure");
    return res.status(500).send("Adding user to Database failure");
  })*/
})

app.get("/recipe/:id", (req, res) => {
  let id = req.params.id;
  axios.get(`${spoonacularUrl}recipes/${id}/information?apiKey=${spoonacularApi}`).then(response => {
    console.log(response);
    res.status(200).send(response.data);
  })
})

app.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
})
