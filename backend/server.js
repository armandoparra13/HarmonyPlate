import express from 'express';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from "firebase/database";
import firebaseConfig from './env_backend.json' assert { type: 'json' };
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import axios from 'axios';
import env from './env.json' assert {type: 'json'}
import cors from 'cors';
import request from 'request';
import axios from 'axios';
import path from 'path';
import multer from 'multer';


const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use(cors());

// Initialize Firebase, Realtime Database, Authentication
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);
const auth = getAuth();

const port = process.env.PORT || 5000;
const hostname = "localhost";

//storage for pictures
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../front/public/uploads')
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname));
        //callback, cb(error, filename)
        //filename is date + the original name of file
        /*
        for storing images under specific user id:

        const userID = req.user.id; 
        const fileNumber = req.user.imageCount || 0;
           //keep track of number of images

        const uniqueFileName = `${userID}-${fileNumber}${path.extname(file.originalname)}
        
         // update user image count
        req.user.imageCount = fileNumber + 1;

        cb(null, uniqueFilename);
        */
    }
});

const upload = multer({ storage: storage});

global.access_token = ''
var CLIENT_ID = firebaseConfig.spotifyClientID;
var REDIRECT_URI = firebaseConfig.spotifyRedirectURI;
const CLIENT_SECRET = firebaseConfig.spotifyClientSecret;

var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

app.get('/auth/spotify', function(req, res) {
    console.log('login');
  var state = generateRandomString(16);
  var scope = 'user-read-private user-read-email user-top-read';

  var auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: scope,
    redirect_uri: REDIRECT_URI,
    state: state
  })

  const spotifyAuthUrl = 'https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString();

  // Perform the redirect
  res.redirect(spotifyAuthUrl);
});

app.get('/auth/spotify-success', (req, res) => {

    var code = req.query.code;
  
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
        'Content-Type' : 'application/x-www-form-urlencoded'
      },
      json: true
    };
  
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        console.log(body.access_token);
        let access_token = body.access_token;

        axios.get('https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=20', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        }).then(response => {
            const topArtists = response.data.items;

            topArtists.forEach(artist => {
                const artistName = artist.name;
                const artistGenres = artist.genres;
                const artistPopularity = artist.popularity;

                console.log(`Artist name: ${artistName}`);
                console.log(`Genres: ${artistGenres.join(', ')}`);
                
            })
            //res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);
            //console.log(response.data.name[0]);
        }).catch(error => {
            res.send(error);
        })
        res.redirect('/spotify-success')
      }
    });
  })

  app.get('/auth/token', (req, res) => {
    
    res.json(
       {
          access_token: access_token
       })

    //console.log(res.json());
  })

const images = [];
app.get('/auth/images', (req, res) => {
    res.json(images);
});


app.post('/signup',  (req, res) => {
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

app.post('/auth/upload', upload.single('image'), (req, res) => {
    if (req.file) {
        res.json({ imageUrl: '/uploads/${req.file.filename}' });
    } else {
        res.status(400).json({ message: 'No file uploaded' });
    }
});

  /*
app.get('/auth/profile-data', async (req, res) => {
    console.log(access_token);
    try {
        const profileResponse = await axios.get("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        if (profileResponse.status === 200) {
            const profileData = profileResponse.data;
            //res.json(profileData);
        } else {
            res.status(500).send("Error fetching profile data");
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).send("Internal Server Error");
    }
});
*/

app.get('/api', (req, res) => {
    console.log('yuh');
  res.json({ users: ['userOne', 'userTwo'] });
});
app.use(express.json());

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
