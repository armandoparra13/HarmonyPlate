import express from 'express';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from "firebase/database";
import firebaseConfig from './firebase_config.json' assert { type: 'json' };
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const app = express();
app.use(express.json());

// Initialize Firebase, Realtime Database, Authentication
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);
const auth = getAuth();

const port = 5000;
const hostname = "localhost";

app.post("/signup",  (req, res) => {
    // verify input is valid
    let body = req.body;
    console.log(body);

    if (
        !body.hasOwnProperty("username") ||
        !body.hasOwnProperty("email") ||
        !body.hasOwnProperty("password") ||
        body.username.trim() === "" || 
        body.email.trim() === "" ||
        !body.password.trim() === ""
      ) {
        return res.status(500).send("Invalid request.");
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
        }).then(() => {
            return res.send("User creation successful");
        }).catch((error) => {
            console.log("Adding user to Database failure", error.message);
            return res.status(error.code).send(error.message);
        })
        
    })
    .catch((error) => {
        console.log("User authentication creation failure", error.message);
        return res.status(error.code).send(error.message);
    });

});

app.listen(port, hostname, () => {
    console.log(`http://${hostname}:${port}`);
})