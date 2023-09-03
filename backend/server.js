import express from 'express';
import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  limitToFirst,
  ref,
  set,
  update,
  query,
  orderByKey,
  onValue,
  child,
} from 'firebase/database';
import env from './env_backend.json' assert { type: 'json' };
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import admin from 'firebase-admin';
import serviceAccount from './serviceAccount.json' assert { type: 'json' };
import cors from 'cors';
import request from 'request';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { decode } from 'punycode';

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
const httpServer = createServer();

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
const hostname = 'localhost';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://harmonyplate-68e8b-default-rtdb.firebaseio.com',
});

app.post('/auth/signup', (req, res) => {
  // verify input is valid
  let body = req.body;
  console.log(body);

  if (
    !body.hasOwnProperty('username') ||
    !body.hasOwnProperty('email') ||
    !body.hasOwnProperty('password') ||
    !body.hasOwnProperty('gender') ||
    !body.hasOwnProperty('dateOfBirth') ||
    body.gender.trim() === '' ||
    body.dateOfBirth.trim() === '' ||
    body.username.trim() === '' ||
    body.email.trim() === '' ||
    body.password.trim() === ''
  ) {
    return res.status(400).send('Invalid request.');
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
        picturesUploaded: false,
        spotifyLinked: false,
        foodsChosen: false,
      })
        .then(() => {
          return res.send('User creation successful');
        })
        .catch(() => {
          console.log('Adding user to Database failure');
          return res.status(500).send('Adding user to Database failure');
        });
    })
    .catch(() => {
      console.log('User authentication creation failure');
      return res.status(500).send('User authentication creation failure');
    });
});

//SPOTIFY

let CLIENT_ID = env['spotifyClientID'];
let REDIRECT_URI = env['spotifyRedirectURI'];
let CLIENT_SECRET = env['spotifyClientSecret'];

var generateRandomString = function (length) {
  var text = '';
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

app.get('/auth/spotify', function (req, res) {
  console.log('login');
  console.log(req.query.accessToken);
  var state = req.query.accessToken;
  var scope = 'user-read-private user-read-email user-top-read';

  var auth_query_parameters = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: scope,
    redirect_uri: REDIRECT_URI,
    state: state,
  });
  //console.log("state", state);

  const spotifyAuthUrl =
    'https://accounts.spotify.com/authorize/?' +
    auth_query_parameters.toString();

  res.redirect(spotifyAuthUrl);
});

app.get('/auth/spotify-success', (req, res) => {
  var code = req.query.code;
  console.log(code);
  console.log('access', req.query.state);
  let firebaseAccessToken = req.query.state;

  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    },
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    //console.log(response.statusCode);
    if (!error && response.statusCode === 200) {
      //console.log(body.access_token);
      let access_token = body.access_token;

      axios
        .get(
          'https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=20',
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        )
        .then((response) => {
          const topArtists = response.data.items;
          const artistNames = topArtists.map((artist) => artist.name);
          const artistGenres = topArtists.map((artist) => artist.genres);
          /*
            topArtists.forEach(artist => {
                const artistName = artist.name;
                const artistGenres = artist.genres;
                const artistPopularity = artist.popularity;

                console.log(`Artist name: ${artistName}`);
                console.log(`Genres: ${artistGenres.join(', ')}`);
                
            })
            */
          //res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);
          //console.log(response.data.name[0]);
          admin
            .auth()
            .verifyIdToken(firebaseAccessToken)
            .then((decodedToken) => {
              update(ref(database, 'users/' + decodedToken.uid), {
                spotify: {
                  artistNames: artistNames,
                  artistGenres: artistGenres,
                },
                spotifyLinked: true,
              })
                .then(() => {
                  res.redirect('/spotify-success');
                })
                .catch(() => {
                  //console.log("Adding Spotify failed");
                  return res.status(500).send('Adding Spotify failure');
                });
            })
            .catch((error) => {
              throw new Error('Error while verifying token:', error);
            });
        })
        .catch((error) => {
          res.send(error);
        });
      //res.redirect('/spotify-success')
    }
  });
});

app.get('/auth/token', (req, res) => {
  res.json({
    access_token: access_token,
  });

  //console.log(res.json());
});

let spoonacularUrl = env['spoonacular_url'];
let spoonacularApi = env['spoonacular_key'];

app.get('/', (req, res) => {
  res.send('HarmonyPlate API');
});

app.get('/api', (req, res) => {
  res.json({ users: ['userOne', 'userTwo'] });
});

app.get('/auth/search', async (req, res) => {
  try {
    const query = req.query.query;
    const cuisine = req.query.cuisine;
    const diet = req.query.diet;

    if (!query) {
      return res.status(400).json({ error: 'Invalid Query' });
    }

    if (!cuisine || cuisine === '') {
      return res.status(400).json({ error: 'No cuisine chosen' });
    }

    const url = `${spoonacularUrl}recipes/complexSearch?query=${query}&cuisine=${cuisine}${
      diet ? '&diet=' + diet : ''
    }&apiKey=${spoonacularApi}`;

    const response = await axios.get(url);

    if (response.data && response.data.results) {
      return res.status(200).json({ options: response.data.results });
    } else {
      return res.status(500).json({ error: 'Error fetching search results' });
    }
  } catch (error) {
    console.error('Error during search:', error);
    return res
      .status(500)
      .json({ error: 'An error occurred during the search' });
  }
});

app.post('/auth/foodChoice', async (req, res) => {
  // verify input is valid
  let body = req.body;

  if (!body.hasOwnProperty('chosenFood') || body.chosenFood.trim() === '') {
    return res.status(400).send('No food chosen');
  }

  if (!body.hasOwnProperty('cuisine')) {
    return res.status(400).json({
      error: 'No cuisine chosen',
    });
  }

  if (!body.hasOwnProperty('diet')) {
    return res.status(400).json({
      error: 'No diet chosen',
    });
  }

  let food = body.chosenFood;
  let diet = body.diet === '' ? 'No preference' : body.diet;
  let cuisine = body.cuisine;

  console.log(food, diet, cuisine);
  console.log(body.chosenFood);
  admin
    .auth()
    .verifyIdToken(req.headers.authorization)
    .then((decodedToken) => {
      return update(ref(database, 'users/' + decodedToken.uid), {
        food: {
          favoriteFood: food,
          diet: diet,
          cuisine: cuisine,
        },
        foodsChosen: true,
      });
    })
    .then(() => {
      console.log('Adding Favorite Food succeeded');
      //res.redirect('/create-profile');
      return res.status(200).send('Food choice submitted successfully.');
    })
    .catch((error) => {
      console.error('Error while processing food choice:', error);
      return res.status(500).json('Food choice submission failed.');
    });
});

app.get('/auth/getMatches', (req, res) => {
  let usersSnapshot = query(
    ref(database, 'users'),
    orderByKey(),
    limitToFirst(10)
  );
  let randomUserIds = [];

  admin
    .auth()
    .verifyIdToken(req.headers.authozriation)
    .then((decodedToken) => {
      onValue(
        usersSnapshot,
        (snapshot) => {
          snapshot.forEach((childSnapshot) => {
            let childKey = childSnapshot.key;
            if (decodedToken.uid !== childKey) {
              console.log(childKey);
              randomUserIds.push(childKey);
            }
          });

          update(ref(database, 'users/' + decodedToken.uid), {
            pool: randomUserIds,
          }).catch(() => {
            console.log('Updating user pool failed');
            return res.status(500).send('Updating user pool failed');
          });
        },
        {
          onlyOnce: true,
        }
      );
    })
    .catch((error) => {
      throw new Error('Error while verifying token:', error);
    });
});

app.get('/auth/recipe/:id', (req, res) => {
  let id = req.params.id;
  axios
    .get(`${spoonacularUrl}recipes/${id}/information?apiKey=${spoonacularApi}`)
    .then((response) => {
      console.log(response);
      res.status(200).send(response.data);
    });
});

//description

app.post('/auth/submit-desc', async (req, res) => {
  let body = req.body;
  console.log(req.headers.authorization);
  console.log(body.desc);
  admin
    .auth()
    .verifyIdToken(req.headers.authorization)
    .then((decodedToken) => {
      update(ref(database, 'users/' + decodedToken.uid), {
        description: body.desc,
      }).catch(() => {
        console.log('Adding desc failed');
        return res.status(500).send('Adding desc failure');
      });
    })
    .catch((error) => {
      throw new Error('Error while verifying token:', error);
    });
});

const pictureCounters = {};

//UPLOAD PICTURES
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);

      const userID = decodedToken.uid;

      const userFolderPath = path.join('../front/public/uploads', userID);
      fs.mkdirSync(userFolderPath, { recursive: true });

      //req.decodedToken = decodedToken;

      cb(null, userFolderPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: async (req, file, cb) => {
    try {
      const fileExtension = path.extname(file.originalname);
      const token = req.headers.authorization?.split(' ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      const userID = decodedToken.uid;
      //console.log(userID);
      //console.log(token);

      const pictureNumber = pictureCounters[userID] || 0; // Get the picture number for the user

      // Increment the picture counter for the user
      pictureCounters[userID] = pictureNumber + 1;

      const uniqueFilename = `${userID}_${pictureNumber}${fileExtension}`;

      cb(null, uniqueFilename);
    } catch (error) {
      cb(error);
    }
  },
});

const upload = multer({ storage });

// Route to handle image upload
app.post('/auth/upload', upload.single('image'), (req, res) => {
  if (req.file) {
    res.json({ imageUrl: '/uploads/${req.file.filename}' });
    const idToken = req.headers.authorization?.replace('Bearer ', '');
    admin
      .auth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        update(ref(database, 'users/' + decodedToken.uid), {
          picturesUploaded: true,
        }).catch(() => {
          return res.status(500).send('Adding picture failure');
        });
      })
      .catch((error) => {
        throw new Error('Error while verifying token:', error);
      });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});

async function fetchUserData(req, res, next) {
  const idToken = req.headers.authorization?.replace('Bearer ', '');

  try {
    if (idToken) {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const userRef = admin.database().ref(`/users/${uid}`);
      userRef.once('value', (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          const spotifyLinked = userData.spotifyLinked || false;
          const foodsChosen = userData.foodsChosen || false;
          const picturesUploaded = userData.picturesUploaded || false;

          req.userData = {
            picturesUploaded,
            spotifyLinked,
            foodsChosen,
          };
          next();
        } else {
          console.log('User data not found');
        }
      });
    }
  } catch (error) {
    console.error('Error verifying ID token:', error);
  }
}

app.get('/auth/fetch-user-data', fetchUserData, (req, res) => {
  if (req.userData) {
    res.json(req.userData);
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

//CHATS
const socketIO = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

socketIO.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  //Listens and logs the message to the console
  socket.on('message', (data) => {
    socketIO.emit('messageResponse', data);
  });

  socket.on('typing', (data) => socket.broadcast.emit('typingResponse', data));

  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
  });
});

app.post('/saveChat', (req, res) => {
  let body = req.body;

  if (
    !body.hasOwnProperty('receiverID') ||
    !body.hasOwnProperty('senderID') ||
    !body.hasOwnProperty('message') ||
    body.message.trim() === ''
  ) {
    return res.status(400).send('Invalid request.');
  }

  admin
    .auth()
    .verifyIdToken(req.headers.authorization)
    .then((decodedToken) => {
      update(ref(database, 'messages/' + decodedToken.uid), {
        name: body.receiverID,
        senderID: body.senderID,
        message: body.message,
      }).catch(() => {
        console.log('Adding New Message failed');
        return res.status(500).send('Adding New Message failure');
      });
    })
    .catch((error) => {
      throw new Error('Error while verifying token:', error);
    });
});

app.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});

// Get info for user's profile
app.get('/auth/getUserProfile', (req, res) => {
  admin
    .auth()
    .verifyIdToken(req.headers.authorization)
    .then((decodedToken) => {
      const userRef = ref(database, 'users/' + decodedToken.uid);

      onValue(
        userRef,
        (snapshot) => {
          const userData = snapshot.val();
          res.status(200).json(userData);
        },
        {
          onlyOnce: true,
        }
      );
    })
    .catch((error) => {
      console.error('Error while verifying token:', error);
      res.status(500).send('Error while retrieving user profile');
    });
});
