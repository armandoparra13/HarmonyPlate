import express from 'express';
import { initializeApp } from 'firebase/app';
import { getDatabase, limitToFirst, ref, set, update, query, orderByKey, onValue, child} from "firebase/database";
import env from './env_backend.json' assert { type: 'json' };
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import axios from 'axios';
import admin from 'firebase-admin';
import serviceAccount from "./serviceAccount.json" assert { type: 'json' };

const app = express();
app.use(express.json());

let api_key = env['apiKey'];
let domain = env['authDomain'];
let db_url = env['databaseURL'];
let project_id = env['projectId'];
let storage_bucket = env['storageBucket'];
let mess_sender = env['messagingSenderId'];
let app_id = env['appId'];
let measure_id = env['measurementId'];

const firebaseConfig = {
  apiKey: api_key,
  authDomain: domain,
  databaseURL: db_url,
  projectId: project_id,
  storageBucket: storage_bucket,
  messagingSenderId: mess_sender,
  appId: app_id,
  measurementId: measure_id,
};

// Initialize Firebase, Realtime Database, Authentication
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);
const auth = getAuth();

const port = 5000;
const hostname = "localhost";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://harmonyplate-68e8b-default-rtdb.firebaseio.com"
});

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
        spotifyLinked: false,
        foodsChosen: false
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

app.post("/foodChoice", async (req, res) => {
  // verify input is valid
  let body = req.body;

  if (
    !body.hasOwnProperty("chosenFood") ||
    body.chosenFood.trim() === ""
  ) {
    return res.status(400).send("Invalid request.");
  }

  console.log(body.chosenFood)
  admin.auth()
    .verifyIdToken(req.headers.authorization)
    .then(decodedToken => {
      update(ref(database, 'users/' + decodedToken.uid), {
        food: { favoriteFood: body.chosenFood }
      }).catch(() => {
        console.log("Adding Favorite Food failed");
        return res.status(500).send("Adding Favorite Food failure");
      })

    })
    .catch(error => {
      throw new Error('Error while verifying token:', error)
    })

})

app.get("/getMatches", (req, res) => {
  let usersSnapshot = query(ref(database, 'users'), orderByKey(), limitToFirst(10));
  let randomUserIds = [];

    // update user pool start
    admin.auth()
    .verifyIdToken(req.headers.authorization)
    .then(decodedToken => {
      //first get 10 random users
      onValue(usersSnapshot, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          let childKey = childSnapshot.key;
          if (decodedToken.uid !== childKey) {
            console.log(childKey);
            randomUserIds.push(childKey);
          }
        });
      
      //then update current user pool
      update(ref(database, 'users/' + decodedToken.uid), {
        pool: randomUserIds
      }).catch(() => {
        console.log("Updating user pool failed");
        return res.status(500).send("Updating user pool failed");
      })

      }, {
        onlyOnce: true
      });
    })
    .catch(error => {
      throw new Error('Error while verifying token:', error)
    })

});

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
