const mongoose = require('mongoose');



const group = mongoose.Schema({
  name : {
    type:String
  },
  members : [],
  result: {
    type: Object,
    default: {
      position: "",
      grade: ""
    }
  },

})




const groupProgram = mongoose.Schema({
 
  name: {
    type: String,
    required: true,
  },
  sectionData: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  stage: {
    type: String,
    required: true,
  },
  groupProgram: {
     maxconperteam: {
      type: Number,
    },
    maxTeamsPerUser: {
      type: Number,
    },
  },
  published: {
    type: Boolean,
    default: false,
  },
  status: {
    type: Boolean,
    default: false,
  },
  language: {
    type: String,
  },
  registeredTeams:  [group],
  }, { timestamps: true });

module.exports = mongoose.model('GroupProgram', groupProgram);

