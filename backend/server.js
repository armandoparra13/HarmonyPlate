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
  get,
  child,
} from 'firebase/database';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import admin from 'firebase-admin';
import cors from 'cors';
import request from 'request';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase, Realtime Database, Authentication
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);
const auth = getAuth();

const port = 5000;
const hostname = 'localhost';

const serviceAccountConfig = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY,
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER,
  client_x509_cert_url: process.env.CLIENT_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountConfig),
  databaseURL: 'https://harmonyplate-68e8b-default-rtdb.firebaseio.com',
});

app.post('/auth/signup', (req, res) => {
  // verify input is valid
  let body = req.body;

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

      let randomString = generateRandomString(10);

      set(ref(database, 'users/' + user.uid), {
        username: body.username,
        email: body.email,
        dateOfBirth: body.dateOfBirth,
        gender: body.gender,
        picturesUploaded: 0,
        spotifyLinked: false,
        foodsChosen: false,
        randomString: randomString,
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

let CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
let REDIRECT_URI = process.env.REDIRECT_URI;
let CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

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
  var state = req.query.accessToken;
  var scope = 'user-read-private user-read-email user-top-read';

  var auth_query_parameters = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: scope,
    redirect_uri: REDIRECT_URI,
    state: state,
  });

  const spotifyAuthUrl =
    'https://accounts.spotify.com/authorize/?' +
    auth_query_parameters.toString();

  res.redirect(spotifyAuthUrl);
});

app.get('/auth/spotify-success', (req, res) => {
  var code = req.query.code;
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
    if (!error && response.statusCode === 200) {
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
          res.send({ error: error });
        });
      //res.redirect('/spotify-success')
    }
  });
});

app.get('/auth/token', (req, res) => {
  res.json({
    access_token: access_token,
  });
});

let spoonacularUrl = process.env.SPOONACULAR_URL;
let spoonacularApi = process.env.SPOONACULAR_API;

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
    .verifyIdToken(req.headers.authorization)
    .then(async (decodedToken) => {
      try {
        const userSnapshot = await ref(database, 'users/' + decodedToken.uid);
        onValue(
          usersSnapshot,
          (snapshot) => {
            snapshot.forEach((childSnapshot) => {
              let childKey = childSnapshot.key;
              if (decodedToken.uid !== childKey) {
                randomUserIds.push(childKey);
              }
            });

            let currentPool = userSnapshot.pool ? userSnapshot.pool : [];

            update(ref(database, 'users/' + decodedToken.uid), {
              pool: currentPool.concat(randomUserIds),
            }).catch(() => {
              return res.status(500).send('Updating user pool failed');
            });
          },
          {
            onlyOnce: true,
          }
        );
      } catch (error) {
        console.error(error);
        return res.status(500).json('Error Getting Matches');
      }
      return res.status(200).send(randomUserIds);
    })
    .catch((error) => {
      throw new Error('Error while verifying token:', error);
    });
});

app.get('/auth/getMatchesInfo', async (req, res) => {
  try {
    const decodedToken = await admin
      .auth()
      .verifyIdToken(req.headers.authorization);
    const usersSnapshot = await ref(database, 'users/' + decodedToken.uid);
    const userSnap = await new Promise((resolve, reject) => {
      onValue(
        usersSnapshot,
        (snapshot) => {
          resolve(snapshot.val());
        },
        (error) => {
          reject(error);
        }
      );
    });

    const matchList = [];

    // Use Promise.all to fetch data for all matches concurrently rather than one at a time
    if (userSnap.pool && userSnap.pool.length > 0) {
      await Promise.all(
        userSnap.pool?.map(async (id) => {
          const matchSnapshot = ref(database, 'users/' + id);
          const matchSnap = await new Promise((resolve, reject) => {
            onValue(
              matchSnapshot,
              (snapshot) => {
                resolve(snapshot.val());
              },
              (error) => {
                reject(error);
              }
            );
          });
          const randomString = matchSnap.randomString || '';
          const imagesDirectory = path.join(
            '../front/public/uploads',
            randomString
          );
          let images = [];

          try {
            if (fs.existsSync(imagesDirectory)) {
              const files = await fs.promises.readdir(imagesDirectory);
              const userImages = files.filter((file) =>
                file.startsWith(`${randomString}_`)
              );
              images = userImages.map(
                (image) => `/uploads/${randomString}/${image}`
              );
            }
          } catch (err) {
            console.error('Error reading user images directory:', err);
            images = [];
          }

          const matchInfo = {
            name: matchSnap.username,
            description: matchSnap.description || null,
            gender: matchSnap.gender || null,
            cuisine: matchSnap.food ? matchSnap.food.cuisine : null,
            artist: matchSnap.spotify ? matchSnap.spotify.artistNames[0] : null,
            images: images,
            path: matchSnap.randomString ? matchSnap.randomString : null,
          };

          matchList.push(matchInfo);
        })
      );
    } else {
      return res.status(500).json('No pool');
    }
    return res.status(200).json(matchList);
  } catch (error) {
    console.error(error);
    return res.status(500).json('Error Authenticating User');
  }
});

async function fillPoolFromDatabase(usersSnapshots, currentPool, decodedToken) {
  return new Promise((resolve, reject) => {
    onValue(
      usersSnapshots,
      (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const childKey = childSnapshot.key;
          if (decodedToken.uid !== childKey) {
            currentPool.push(childKey);
          }
        });
        resolve(currentPool); // Resolve the promise when done
      },
      (error) => {
        reject(error); // Reject the promise on error
      }
    );
  });
}

app.post('/auth/addMatch', async (req, res) => {
  try {
    const decodedToken = await admin
      .auth()
      .verifyIdToken(req.headers.authorization);
    const usersSnapshot = await ref(database, 'users/' + decodedToken.uid);
    const userSnap = await new Promise((resolve, reject) => {
      onValue(
        usersSnapshot,
        (snapshot) => {
          resolve(snapshot.val());
        },
        (error) => {
          reject(error);
        }
      );
    });
    let currentPool = userSnap.pool ? userSnap.pool : [];
    let currentMatched = userSnap.matched ? userSnap.matched : [];
    let liked = currentPool.shift();
    currentMatched.push(liked);

    if (currentPool.length === 1) {
      let usersSnapshots = query(
        ref(database, 'users'),
        orderByKey(),
        limitToFirst(10)
      );
      try {
        await fillPoolFromDatabase(usersSnapshots, currentPool, decodedToken);
      } catch (error) {
        console.log('Error filling the pool');
      }
    }
    update(ref(database, 'users/' + decodedToken.uid), {
      pool: currentPool,
      matched: currentMatched,
    }).catch(() => {
      return res.status(500).send('Updating user pool failed');
    });

    return res.status(200);
  } catch (error) {
    console.error(error);
    return res.status(500).json('Error Authenticating User');
  }
});

app.post('/auth/addIgnored', async (req, res) => {
  try {
    const decodedToken = await admin
      .auth()
      .verifyIdToken(req.headers.authorization);
    const usersSnapshot = await ref(database, 'users/' + decodedToken.uid);
    const userSnap = await new Promise((resolve, reject) => {
      onValue(
        usersSnapshot,
        (snapshot) => {
          resolve(snapshot.val());
        },
        (error) => {
          reject(error);
        }
      );
    });

    let currentPool = userSnap.pool ? userSnap.pool : [];
    let currentIgnored = userSnap.ignored ? userSnap.ignored : [];
    let skipped = currentPool.shift();
    currentIgnored.push(skipped);
    if (currentPool.length === 1) {
      let usersSnapshots = query(
        ref(database, 'users'),
        orderByKey(),
        limitToFirst(10)
      );
      try {
        await fillPoolFromDatabase(usersSnapshots, currentPool, decodedToken);
      } catch (error) {
        console.error('Error filling the pool from the database:', error);
        // Handle the error appropriately
      }
    }

    update(ref(database, 'users/' + decodedToken.uid), {
      pool: currentPool,
      ignored: currentIgnored,
    }).catch(() => {
      return res.status(500).send('Updating user pool failed');
    });

    return res.status(200);
  } catch (error) {
    console.error(error);
    return res.status(500).json('Error Authenticating User');
  }
});

app.get('/auth/recipe/:id', (req, res) => {
  let id = req.params.id;
  axios
    .get(`${spoonacularUrl}recipes/${id}/information?apiKey=${spoonacularApi}`)
    .then((response) => {
      res.status(200).send(response.data);
    });
});

//description

app.post('/auth/submit-desc', async (req, res) => {
  let body = req.body;
  admin
    .auth()
    .verifyIdToken(req.headers.authorization)
    .then((decodedToken) => {
      update(ref(database, 'users/' + decodedToken.uid), {
        description: body.desc,
      }).catch(() => {
        return res.status(500).send('Adding desc failure');
      });
    })
    .catch((error) => {
      throw new Error('Error while verifying token:', error);
    });
});

const pictureCounters = {};

async function getUserRandomString(req) {
  const token = req.headers.authorization?.split(' ')[1];

  try {
    if (token) {
      const decodedToken = await admin.auth().verifyIdToken(token);

      const uid = decodedToken.uid;
      const userRef = admin.database().ref(`/users/${uid}`);

      const snapshot = await userRef.once('value');
      const userData = snapshot.val();

      if (userData && userData.randomString) {
        return userData.randomString;
      } else {
        console.log('User data not found');
        return null;
      }
    }
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return null;
  }
}

//UPLOAD PICTURES
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const userRandomString = await getUserRandomString(req);

      const token = req.headers.authorization?.split(' ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);

      const userID = decodedToken.uid;
      const userRef = ref(database, 'users/' + userID);
      const userSnapshot = await get(userRef);
      const user = userSnapshot.val();

      const userFolderPath = path.join(
        '../front/public/uploads',
        userRandomString
      );
      fs.mkdirSync(userFolderPath, { recursive: true });

      //req.decodedToken = decodedToken;
      cb(null, userFolderPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: async (req, file, cb) => {
    try {
      const userRandomString = await getUserRandomString(req);
      const fileExtension = path.extname(file.originalname);

      const pictureNumber = pictureCounters[userRandomString] || 0; // Get the picture number for the user

      pictureCounters[userRandomString] = pictureNumber + 1;

      const uniqueFilename = `${userRandomString}_${pictureNumber}${fileExtension}`;

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
    const idToken = req.headers.authorization?.replace('Bearer ', '');

    admin
      .auth()
      .verifyIdToken(idToken)
      .then(async (decodedToken) => {
        const userID = decodedToken.uid;
        const userRef = ref(database, 'users/' + userID);

        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();
        console.log('pictures:', userData);

        if (userData && userData.picturesUploaded !== undefined) {
          const currentCount = userData.picturesUploaded;
          const newCount = currentCount + 1;
          console.log('New picture count:', newCount);

          update(ref(database, 'users/' + decodedToken.uid), {
            picturesUploaded: newCount,
          }).catch((error) => {
            console.error('Error updating picture count:', error);
            return res.status(500).send('Adding picture failure');
          });
        } else {
          console.error('User data is missing picturesUploaded.');
          return res.status(500).send('User data is missing picturesUploaded.');
        }
      })
      .catch((error) => {
        console.error('Error verifying token:', error);
        return res.status(500).send('Error verifying token');
      });
  } else {
    console.error('No file uploaded');
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

      // Fetch user data
      userRef.once('value', (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          const spotifyLinked = userData.spotifyLinked || false;
          const foodsChosen = userData.foodsChosen || false;
          const picturesUploaded = userData.picturesUploaded || 0;

          // Store user data in the request object
          req.userData = {
            picturesUploaded,
            spotifyLinked,
            foodsChosen,
          };
          next();
        } else {
          console.error('User data not found');
        }
      });
    }
  } catch (error) {
    console.error('Error verifying ID token:', error);
  }
}

app.get('/auth/fetch-user-data', fetchUserData, (req, res) => {
  if (req.userData) {
    // Respond with user data
    res.json(req.userData);
  } else {
    console.error('Unauthorized or user data not found');
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.get('/auth/fetch-user-images', async (req, res) => {
  const idToken = req.headers.authorization?.replace('Bearer ', '');

  try {
    if (idToken) {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const userRef = admin.database().ref(`/users/${uid}`);

      // Fetch user data
      userRef.once('value', (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          const randomString = userData.randomString || '';

          const userImagesDirectory = path.join(
            '../front/public/uploads',
            randomString
          );

          if (fs.existsSync(userImagesDirectory)) {
            fs.readdir(userImagesDirectory, (err, files) => {
              if (err) {
                console.error('Error reading user images directory:', err);
                res.status(500).json({ error: 'Internal server error' });
              } else {
                // Filter files based on the naming convention 'randomstring
                const userImages = files.filter((file) =>
                  file.startsWith(`${randomString}_`)
                );

                // Construct URLs for the images
                const imageUrls = userImages.map(
                  (image) => `/uploads/${randomString}/${image}`
                );

                res.json({ imageUrls });
              }
            });
          } else {
            res.json({ imageUrls: [] });
          }
        } else {
          console.error('User data not found');
        }
      });
    }
  } catch (error) {
    console.error('Error verifying ID token:', error);
  }
});

app.delete('/auth/delete-image', async (req, res) => {
  const idToken = req.headers.authorization?.replace('Bearer ', '');
  const imageUrlToDelete = req.body.imageUrl;

  try {
    if (!idToken || !imageUrlToDelete) {
      return res.status(400).json({ error: 'Invalid request.' });
    }

    // Verify the user's ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const userRef = admin.database().ref(`/users/${uid}`);

    // Fetch user data
    userRef.once('value', async (snapshot) => {
      const userData = snapshot.val();
      if (userData) {
        const randomString = userData.randomString || '';

        if (fs.existsSync('../front/public')) {
          const imageFilePath = path.join('../front/public', imageUrlToDelete);

          if (fs.existsSync(imageFilePath)) {
            // Delete the image file
            fs.unlinkSync(imageFilePath);
            if (userData && userData.picturesUploaded !== undefined) {
              const currentCount = userData.picturesUploaded;
              const newCount = currentCount - 1;

              update(ref(database, 'users/' + decodedToken.uid), {
                picturesUploaded: newCount,
              }).catch((error) => {
                console.error('Error updating picture count:', error);
                return res.status(500).send('Adding picture failure');
              });
            } else {
              console.error('User data is missing picturesUploaded.');
              return res
                .status(500)
                .send('User data is missing picturesUploaded.');
            }

            res.status(200).json({ message: 'Image deleted successfully.' });
          } else {
            console.error(`Image not found: ${imageFilePath}`);
            res.status(404).json({ error: 'Image not found.' });
          }
        } else {
          console.error('User images directory not found.');
          res.status(500).json({ error: 'Internal server error.' });
        }
      } else {
        console.error('User data not found.');
        res.status(500).json({ error: 'Internal server error.' });
      }
    });
  } catch (error) {
    console.error('Error verifying ID token:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

//CHATS
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('⚡: A user connected');

  socket.on('join_room', (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on('send_message', (data) => {
    socket.to(data.room).emit('receive_message', data);
  });

  // Handle disconnection event
  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
  });
});

app.get('/auth/getMatchProfile', (req, res) => {
  const { uid } = req.query;

  if (!uid) {
    return res.status(400).json({ error: 'UID parameter is missing' });
  }

  const userRef = ref(database, 'users/' + uid);

  onValue(
    userRef,
    (snapshot) => {
      const userData = snapshot.val();

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(userData);
    },
    {
      onlyOnce: true,
    }
  );
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
