const mongoose = require('mongoose')


const programDetails = mongoose.Schema({
  __id: {
    type: String,
  },
  name: {
    type: String
  },
  verified: {
    type: Boolean,
    default: false
  },
  result: {
    type: Object,
    default: {
      position: "",
      grade: ""
    }
  }
});

const contestentData = mongoose.Schema({
  user: { type: String, required: true },
  name: {
    type: String,
    required: true
  },
  sectionData: {
    type: String,
    required: true,
  },
  admNo: {
    type: String,
    required: true
  },
  class: {
    type: Number,
  },
  programData: {
    type: [programDetails],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model("contestentData", contestentData);