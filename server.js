'use strict';

const express = require('express');
const app = express();

app.get('/', function (req, res) {
  res.send('hola mundo genial');
});

app.listen(3000, () => console.log('started...'));
