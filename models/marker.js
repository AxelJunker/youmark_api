const mongoose = require('mongoose');

const { Schema } = mongoose;

const MarkerSchema = new Schema({
  user_id: {
    type: String,
    required: [true, 'User id is required'],
  },
  video_id: {
    type: String,
    required: [true, 'Video id is required'],
  },
  text: {
    type: String,
    set: v => v.trim().replace(/ {2,}/g, ' '),
    validate: {
      validator: v => !v.toLowerCase().includes('jump to marker') && v.length <= 20,
      message: props => `"${props.value}" is not a valid text input`,
    },
    required: [true, 'Text is required'],
  },
  progress: {
    type: Number,
    required: [true, 'Progress is required'],
  },
  time: {
    type: String,
    required: [true, 'Time is required'],
  },
  reported: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

MarkerSchema.index({ video_id: 1, text: 1 }, { unique: true });

const Marker = mongoose.model('marker', MarkerSchema);

module.exports = Marker;
