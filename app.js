const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const cors = require('cors');
const template = require('es6-template-strings');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const configFile = require('./config.json');

const defaultConfig = configFile.development;
const environment = process.env.NODE_ENV || 'development';
const environmentConfig = configFile[environment];
const config = Object.assign(defaultConfig, environmentConfig);

const mongooseOpts = { useNewUrlParser: true, useCreateIndex: true };
const mongoUri = template(config.mongo.uri, { DB_PW: process.env.DB_PW });
mongoose.connect(mongoUri, mongooseOpts);

const logger = (req, res, next) => {
  console.log(req.method + ' ' + req.path);
  if (req.body) {
    console.log('Body:');
    console.log(req.body);
  }
  if (Object.keys(req.query).length) {
    console.log('Query:');
    console.log(req.query);
  }
  if (Object.keys(req.params).length) {
    console.log('Params:');
    console.log(req.params);
  }
  next();
};

const markerRoutes = require('./routes/marker.js');

app.use(logger);
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cors());
app.use('/', markerRoutes);

const { port } = config;

server.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

io.on('connection', (socket) => {
  socket.on('markerAdd', (data) => {
    console.log('socket markerAdd');
    console.log(data);
    delete data.user_id;
    socket.broadcast.emit('markerAdd', data);
  });
  socket.on('markerRemove', (data) => {
    console.log('socket markerRemove');
    console.log(data);
    socket.broadcast.emit('markerRemove', data);
  });
});
