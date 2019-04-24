const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const cors = require('cors');
const template = require('es6-template-strings');
const dotenv = require('dotenv');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const logger = require('./inc/logger');

dotenv.config();
const configFile = require('./config.json');

const defaultConfig = configFile.development;
const environment = process.env.NODE_ENV || 'development';
const environmentConfig = configFile[environment];
const config = Object.assign(defaultConfig, environmentConfig);

const mongooseOpts = { useNewUrlParser: true, useCreateIndex: true };
const mongoUri = template(config.mongo.uri, { DB_PW: process.env.DB_PW });
mongoose.connect(mongoUri, mongooseOpts);

const markerRoutes = require('./routes/marker.js');

app.use(bodyParser.json());
app.use(methodOverride());
app.use(cors());
app.use('/', markerRoutes);

const { port } = config;

server.listen(port, () => {
  logger.info(`Express server listening on port ${port}`);
});

io.on('connection', (socket) => {
  socket.on('markerAdd', (data) => {
    delete data.user_id;
    socket.broadcast.emit('markerAdd', data);
  });
  socket.on('markerRemove', (data) => {
    socket.broadcast.emit('markerRemove', data);
  });
});
