const express = require("express");
const router = express.Router();
const ContestentData = require("../models/constestents");
const Program = require("../models/program");
const GroupProgram = require("../models/groupProgram");
const User = require('../models/users')
const validatorSchema = require('../models/validator')


// Index Route
router.get("/", (req, res) => {
 
  res.render('ADMIN/admin.ejs')
});

router.get("/add-programs", (req, res) => {
  res.render("ADMIN/add-programs.ejs");
});
router.post("/add-programs", async (req, res) => {
  const newProgram = new Program({
    name: req.body.name,
    sectionData: req.body.sectionData,
    stage: req.body.stagedata,
    group: req.body.groupdata,
    maxCon :req.body.maxcon
  });
  try {
    await newProgram.save();
    res.status(201).redirect("/admin");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



router.get('/verifyPrograms', async(req,res)=>{
  try {
    //const section = req.query.sectionData
   
    const contestants = await ContestentData.find().lean();
    const programs = await Program.find().lean();
  
    const searchQuery = req.query.search || '';

    const programContestantsMap = new Map();
    
    contestants.forEach(contestant => {
      contestant.programData.forEach(pData => {
        const matchingProgram = programs.find(p => p._id.toString() === pData.__id.toString());
        
        if (!matchingProgram) {
          // Handle the case where no matching program is found
          return;
        }
    
        const programId = matchingProgram._id.toString();
    
        if (!programContestantsMap.has(programId)) {
          programContestantsMap.set(programId, {
            programName: matchingProgram.name,
            section : matchingProgram.sectionData,
            stage : matchingProgram.stage,
            language: matchingProgram.language,
            published : matchingProgram.published,
            contestants: [],
          });
        }
    
        programContestantsMap.get(programId).contestants.push(contestant);
      });
    });
   
     
      res.render('ADMIN/verify.ejs',{programContestantsMap, searchQuery})
  } catch (error) {
    console.log(error)
  }
})

router.post('/verifyProgram/:contestantId/:programId', async (req, res) => {
  try {
    const contestantId = req.params.contestantId;
    const programId = req.params.programId
   

    // Find the contestant by ID
    const contestant = await ContestentData.findById(contestantId);

    if (!contestant) {
      return res.status(404).send('Contestant not found');
    }

   
    
       // Find the object in programData array with the specified ID
       const program = await contestant.programData.find(program => program.__id === programId);
       console.log(program)
       if (!program) {
         return res.status(404).send('Program not found');
       }
       
      program.verified = !program.verified ;
      
        // Save the updated contestant
        await contestant.save();
       // Found program object
       // Perform verification logic for the program
   
    res.redirect('/admin/verifyPrograms');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});
const sectionArr = []
//const user = []


router.get('/contestentVerify',async(req,res)=>{
try {
  const selectedSection = req.query.sectionData;

  // Construct the search query based on the selected section
 
  const constestent = await ContestentData.find();
  res.render('ADMIN/verifyCon.ejs',{ constestent: constestent})
} catch (error) {
}})

//RESULTS ROUTE
    //CON DETAILS
router.get('/CONDetails', async (req,res)=>{
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name =  new RegExp(req.query.name, 'i')
  }
  const constestent = await ContestentData.find(searchOptions);
  
    res.render('ADMIN/1-RESULTS/contetentdetails.ejs', { 
      contestend : constestent,
      searchOptions : req.query
     })
    })

    //PROGRAM DETAILS FOR  ADDING RESULT "INDIVUDUAL PROGRAMS"
router.get('/programDetails', async (req,res)=>{
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name =  new RegExp(req.query.name, 'i')
  }
  const programs = await Program.find(searchOptions);
  
  res.render('ADMIN/1-RESULTS/programDetails.ejs', {
    programs : programs,
    searchOptions : req.query
  })
 })
 

 
 router.get('/addResults/:id', async (req, res) => {

  const programs = await Program.findById(req.params.id);
  const contestants = await ContestentData.find().lean();
 
  const selectedContestants = contestants.filter(c => c.programData.some(p => p.__id === `${req.params.id}`));
  try {
 
    res.render('ADMIN/1-RESULTS/addResult.ejs', {
      programs: programs,
      contestants: selectedContestants,
   });
  
  } catch (error) {
    console.error(error);
    res.send('Error occurred');
  }
});

//RESULT ADING POST ROUTE 
 
router.post('/addResults/:contestantId/:programId', async (req, res) => {
  try {
    const contestantId = req.params.contestantId
    const contestant = await ContestentData.findById(contestantId);

    const matchingProgramData =  contestant.programData.find((p) => p.__id === `${req.params.programId}`)
    
   
    // Assuming matchingProgramData is an array with a single element for the specific contestant
    const contestantData = matchingProgramData;
   
    const result = {
      position: req.body.position,
      grade: req.body.grade,
    };

     contestantData.result = result;

    // Save the updated contestant data
    await contestantData.parent().save()
    res.redirect("/admin/verifyPrograms");
  } catch (error) {
    console.error(error);
    res.redirect('/admin');
  }
});

router.post('/publishProgramResult/:id', async (req, res) => {
  try {
    const programId = req.params.id;

    // Find the program by its ID
    const program = await Program.findById(programId);

    if (!program) {
      // If the program is not found, handle the error
      return res.status(404).send('Program not found');
    }

    // Update the program's published value to true
    program.published = !program.published;
    await program.save();

   

    // Redirect to the addResults route with the updated program's ID
    res.redirect("/admin/verifyPrograms");
  } catch (error) {
    console.error(error);
    res.status(500).send('Error publishing program result.');
  }
});



router.get('/groupPrgramDetails', async (req,res)=>{
  const groupPrograms = await  GroupProgram.find()
  res.render('ADMIN/1-RESULTS/group programs/programDetails.ejs',{groupPrograms})
})
//RESULT ADDIN G FOR GROUP PROGRAM 
router.get('/groupPrgramDetails/:id', async (req,res)=>{
  const id = req.params.id
  const groupPrograms = await  GroupProgram.findById(id)
  res.render('ADMIN/1-RESULTS/group programs/addGroupProgramResult.ejs',{groupPrograms})
})
router.post('/agpr/:id',async  (req,res)=>{
   const programid = req.params.id
  const groupProgram =  await GroupProgram.findById(programid)
  const { groupId , position, grade } = req.body
  try {
    
const reprogram =  groupProgram.registeredTeams.find(t => t._id == groupId)
reprogram.result  = {
  position: position,
  grade: grade
};
    groupProgram.save()
console.log(reprogram.result) 
    res.redirect(`/admin/groupPrgramDetails/${programid}`)
  } catch (error) {
    console.error(error)
    res.send(error)
    }

})

router.post('/publish/GroupProgramResult/:id', async (req, res) => {
  const groupprogram = await GroupProgram.findById(req.params.id);
  try {
  if (!groupprogram) {
      return res.status(404).send('Program not found');
    }
    groupprogram.published = !groupprogram.published;
    await groupprogram.save();
    res.redirect(`/admin/groupPrgramDetails/${req.params.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error publishing program result.');
  }
});




router.get('/add-Group-Programs', async(req,res)=>{
res.render('ADMIN/groupPrgram.ejs')
})

router.post('/c',async(req,res)=>{
  const program =  new GroupProgram({
    name : req.body.name,
    sectionData: req.body.sectionData,
    code : req.body.code,
    stage: req.body.stage,
    groupProgram : {
      maxconperteam : req.body.maxConTeam,
      maxTeamsPerUser: req.body.maxTeam
    },
    language : req.body.language
  })
  try {
    await program.save();
    res.status(201).redirect("/admin/add-Group-Programs");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

//SET ROGRAMS TO VALIDATOR
router.get('/set-P-V',async (req,res)=>{
 try {
  const programs = await Program.find()
  const groupPrgram = await GroupProgram.find()
  const user = await User.find({isEvaluator : true})
  //console.log(user, programs, groupPrgram)
  res.render('ADMIN/validator/forValidator.ejs', {user})

 } catch (error) {
  console.log(error)
  res.redirect('/login')
 }
})
router.get('/2-set-P-V/:id',async (req,res)=>{
  try {
    const programs = await Program.find()
    const groupPrgram = await GroupProgram.find()
    const user = await User.findById(req.params.id)
    res.render('ADMIN/validator/forEachvalidator.ejs', {user, programs, groupPrgram})
  } catch (error) {
    console.log(error)
  res.redirect('/login')
  }
})


router.post('/2-set-P-V/:id',async (req,res)=>{
try {
  
  const user = await User.findById(req.params.id)
  const existingValidator = await validatorSchema.findOne({ validatorId: user.id })

  if (!existingValidator){
    const newvalidator = new validatorSchema({
      validatorName : user.name,
      validatorId : user.id,
    })
    await newvalidator.save()
  }
  res.send('succc')
  
} catch (error) {
  console.log(error)
  res.redirect('/login')
}
})

module.exports = router;
