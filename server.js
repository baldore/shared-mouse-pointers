'use strict';

const app = require('express')();
const port = 3000;

app.get('/', function (req, res) {
  res.sendFile(`${__dirname}/views/index.html`);
});

app.listen(port, function () {
  console.log(`Server started in port ${port}`);
});
