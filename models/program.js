const mongoose = require("mongoose");


const programs = mongoose.Schema(
  //8 values
  {
    sectionData: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    }, 
    code:{
      type:String,
   },
    language:{
      type: String,
    },

    stage: {
      type: String,
      required: true,
    },
    maxCon: {
      type : Number,
      required: true
    },
    published:{
      type: Boolean,
      default:false
    },
    status:{
      type:Boolean,
      default:false
    },
   
  },
  { timestamps: true }
);

module.exports = mongoose.model("programs", programs);
