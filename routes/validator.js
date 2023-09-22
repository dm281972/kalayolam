const express = require("express");
const router = express.Router();

router.get('/', (req,res)=>{
    res.send("validator page")
})


module.exports = router