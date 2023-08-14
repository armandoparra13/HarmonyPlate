const express = require('express');
const app = express();

let port = 5000;
let hostname = 'localhost';

app.get('/api', (req, res) => {
  res.json({ users: ['userOne', 'userTwo'] });
});

app.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});
