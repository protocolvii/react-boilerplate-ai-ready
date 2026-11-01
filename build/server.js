const path = require('path');
const express = require('express');

const host = '127.0.0.1';
const port = 8080;

const app = express();

app.use(express.static(path.resolve(__dirname, './static')));

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'static', 'index.html'));
});

app.listen(port, err => {
  if (err) {
    console.error(`=> OMG!!! 🙀 ${err}`);
  } else {
    console.info('==> 🚧  Server listening at http://%s:%s', host, port);
  }
});
