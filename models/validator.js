const mongoose = require("mongoose");

const validatorPrograms = mongoose.Schema({
    programId : {
        type :String
    }
})

const validatorSchema = mongoose.Schema(
  {
    validatorName : {
        type : String
    },
    validatorId: {
      type: String,
      reqired: true,
    },
   programs : [validatorPrograms]
  },
  { timestamps: true }
);


module.exports = mongoose.model("validator", validatorSchema);
