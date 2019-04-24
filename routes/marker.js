const express = require('express');
const async = require('async');
const Marker = require('../models/marker');
const logger = require('../inc/logger');

const router = express.Router();

const v = 'v1';

router.get(`/api/${v}/marker/:video_id/:user_id`, (req, res) => {
  const { video_id, user_id } = req.params;

  Marker.find({ video_id }, (err, markers) => {
    if (!err && markers) {
      async.each(markers, (marker, markerCB) => {
        if (marker.user_id !== user_id) {
          marker.user_id = undefined;
        }
        markerCB();
      }, () => {
        res.send(markers);
      });
    } else if (err) {
      logger.error(err);
      res.status(500).send({ err: err.message });
    } else {
      logger.error('No markers returned from Marker.find');
      res.status(500).send({ err: 'No markers returned from Marker.find' });
    }
  });
});

router.post(`/api/${v}/marker`, (req, res) => {
  const marker = new Marker(req.body);
  const errors = marker.validateSync();
  if (!errors) {
    marker.save((err, savedMarker) => {
      if (!err && savedMarker) {
        res.send(savedMarker);
      } else if (err) {
        logger.error(err);
        res.status(500).send({ err: err.message });
      } else {
        logger.error('No marker returned from marker.save');
        res.status(500).send({ err: 'No marker returned from marker.save' });
      }
    });
  } else {
    res.status(400).send({ err: errors.message });
  }
});

router.delete(`/api/${v}/marker/:_id/:user_id`, (req, res) => {
  const { _id, user_id } = req.params;

  Marker.findById(_id, (err, marker) => {
    if (!err && marker) {
      if (marker.user_id === user_id) {
        marker.remove((delErr, delMarker) => {
          if (!delErr && delMarker) {
            res.send(delMarker);
          } else if (delErr) {
            logger.error(delErr);
            res.status(500).send({ err: delErr.message });
          } else {
            logger.error('No marker returned from marker.remove');
            res.status(500).send({ err: 'No marker returned from marker.remove' });
          }
        });
      } else {
        res.status(400).send({ err: 'Wrong user_id' });
      }
    } else if (err) {
      logger.error(err);
      res.status(500).send({ err: err.message });
    } else {
      res.status(400).send({ err: 'No marker found with id: ' + _id });
    }
  });
});

router.patch(`/api/${v}/marker/report/:_id`, (req, res) => {
  const { _id } = req.params;

  Marker.findByIdAndUpdate(
    _id,
    { reported: true },
    { new: true },
    (err, marker) => {
      if (!err && marker) {
        res.send(marker);
      } else if (err) {
        logger.error(err);
        res.status(500).send({ err: err.message });
      } else {
        res.status(400).send({ err: 'No marker with id: ' + _id });
      }
    },
  );
});

module.exports = router;
