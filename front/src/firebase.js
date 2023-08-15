// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

let env = require('./env.json');
let api_key = env['fbKey'];
let domain = env['fbauthDomain'];
let db_url = env['fbdatabaseURL'];
let project_id = env['fbProjectId'];
let storage_bucket = env['storageBucket'];
let mess_sender = env['messageSenderId'];
let app_id = env['fbappId'];
let measure_id = env['measurementId'];

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

export const auth = getAuth(app);
export default app;
