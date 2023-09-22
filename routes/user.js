const express = require("express");
const router = express.Router();
const ContestentData = require("../models/constestents");
const Program = require('../models/program');
const GroupProgram = require('../models/groupProgram');
const groupProgram = require("../models/groupProgram");
// Index Route




//TO SELECT CONTESTENT   
const sectionArr = []
const stageArr = []
router.get('/programReg', async (req, res) => {
  let searchOptions = {};
 
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i');
  }

  try {
    const sectionDataToFind = sectionArr.length > 0 ? sectionArr[0] : null;
    const stageToFind = stageArr.length > 0 ? stageArr[0].stage : null;
 
    const filter = {};

    if (sectionDataToFind) {
      filter.sectionData = sectionDataToFind;
    }

    if (stageToFind) {
      filter.stage = stageToFind;
    }

    // Use the searchOptions directly in the filter
    if (searchOptions.name) {
      filter.$or = [
        {name : searchOptions.name},
       {language : new RegExp(req.query.name, 'i')}
      ]
    
    }

    const programs = await Program.aggregate([{$match : filter}]).limit(10);
    const userMainContentPath = '../partials/user/slctProgram.ejs'
    res.render('USER/home.ejs', { programs: programs, searchOptions: req.query , filter : filter, userMainContentPath});
  } catch (error) {
    console.error(error);
  }
});


// Route handler for program registration page


//post request for stage 
router.post('/selectStage', (req,res)=>{
  stageArr.unshift({
    stage : req.body.stage
  })
  res.redirect('/programReg')
})
router.post('/selectsub', (req,res)=>{
  if(req.body.sectionData){
    sectionArr.unshift(req.body.sectionData)
    res.redirect('/programReg')
}
})

router.get('/programReg/:id', async (req,res)=>{
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name =  new RegExp(req.query.name, 'i')
  }
  try {
   if (req.user){
   
    const program = await Program.findById(req.params.id)
   
    const filter = {
      user: req.user.name,
      sectionData: program.sectionData,
      ...searchOptions
    };
    const con = await ContestentData.find(filter)
    const contestents = await ContestentData.find({user: req.user.name, sectionData: program.sectionData}).lean()
    const selectedCon =  contestents.filter(c => 
     c.programData.some(p => p.__id === program.id)); 
   
   const userMainContentPath = '../partials/user/programReg.ejs'
   res.render('USER/home.ejs', {selectedCon: selectedCon, program :program, con:con, searchOptions: req.query, userMainContentPath})
   }else{
    res.redirect('/login')
   }
   
  } catch (error) {
    res.send("error")
    console.log(error)
  }

})




router.post('/programReg/:id', async (req, res) => {
  const constestent = await ContestentData.findById(req.body.conId);
 
 const id  = req.params.id
  const program = await Program.findById(id);

  const allCon = await ContestentData.find({ user: `${req.user.name}` 
  , sectionData: program.sectionData
}).lean();

  try {
    const result = allCon.filter(c =>
      c.programData.some(p => p.__id === id)
    );
    const programExists = constestent.programData.some(p => p.__id === id);

    if (programExists) {
      res.send('Program already exists in this contestant');
    } else if (result.length + 1 > program.maxCon) {
      res.send(`Contestants for this program are already full (${program.maxCon} registered)`);
    } else {
      constestent.programData.unshift({
        name : req.body.programName,
        __id: id,
      });

      constestent.programData = constestent.programData.slice(0, 5);

      await constestent.save();

      res.redirect(`/programReg/${req.params.id}`);
    }
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

//TO REMOVE PROGRAMS FROM CONTESTEND
router.post('/B', async (req, res) => {
  try {
    const { programId, admNo } = req.body;
    
    const contestant = await ContestentData.findOne({ admNo: admNo });

    // Check if the contestant with the provided admNo exists
    if (!contestant) {
      console.log('Contestant not found.');
      return res.redirect('/');
    }

    const programIndex = contestant.programData.findIndex(program => program.__id === programId);

    if (programIndex !== -1) {
      contestant.programData.splice(programIndex, 1);
      await contestant.save();
    }

    res.redirect(`/programReg/${req.body.programId}`);
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});
const sectionArr2 = []
const stageArr2 = []
router.get('/registerGroupPrograms', async(req,res)=>{
try {
    let searchOptions = {};
 
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i');
  }


    const sectionDataToFind = sectionArr2.length > 0 ? sectionArr2[0] : null;
    const stageToFind = stageArr2.length > 0 ? stageArr2[0].stage : null;
 
    const filter = {};

    if (sectionDataToFind) {
      filter.sectionData = sectionDataToFind;
    }

    if (stageToFind) {
      filter.stage = stageToFind;
    }

    // Use the searchOptions directly in the filter
    if (searchOptions.name) {
      filter.$or = [
        {name : searchOptions.name},
       {language : new RegExp(req.query.name, 'i')}
      ]
    
    }

    const programs = await GroupProgram.aggregate([{$match : filter}]).limit(10);
   
const userMainContentPath = '../partials/user/registerGroupPrograms.ejs'
res.render('USER/home.ejs',{ programs: programs, searchOptions: req.query , filter : filter, userMainContentPath})
} catch (error) {
  
}

})
//post route for section of roup program 
router.post('/selectStage2', (req,res)=>{
  stageArr2.unshift({
    stage : req.body.stage
  })
  res.redirect('/registerGroupPrograms')
})
router.post('/selectsub2', (req,res)=>{
  if(req.body.sectionData){
    sectionArr2.unshift(req.body.sectionData)
    res.redirect('/registerGroupPrograms')
}
})
router.get('/registerGroupPrograms/:id', async(req,res)=>{

  const programs = await GroupProgram.findById(req.params.id)
  console.log(programs)
  const constestents = await ContestentData.find()
  const userMainContentPath = '../partials/user/RegisterGroupProgram.ejs'
  res.render('USER/home.ejs', {programs, userMainContentPath, contestent :constestents })
  })

  router.post('/registerContestants', async (req, res) => {
    const programId = req.body.programId;
    const groupProgram = await GroupProgram.findById(programId);
    const contestantsData = [];
    const maxGroupPerUser = groupProgram.groupProgram.maxTeamsPerUser;
  
    try {
      
      groupProgram.registeredTeams = groupProgram.registeredTeams || [];
  
     
      const userTeams = groupProgram.registeredTeams.filter((team) => team.name === req.user.name);
  
      const userTeamsCount = userTeams.length;
 
   
      if (userTeamsCount >= maxGroupPerUser) {
        return res.status(400).send('You have reached the maximum number of teams allowed.');
      }
          
      
      for (let i = 1; i <= req.body.maxconperteam; i++) {
       
          const contestantName = req.body[`contestant${i}`];
          const contestantId = req.body[`id${i}`]
    
       console.log(!contestantName == "")
       
        if (!contestantName == "" ) {
          contestantsData.push({
            name: contestantName,
            id : contestantId
           });
        }else {
          res.send('fill the inputs')
        }
      }

      if (userTeamsCount >= maxGroupPerUser) {
        res.send('users was entered')
      } else {
        groupProgram.registeredTeams.push({
         name: req.user.name, 
          members: contestantsData,
          
        });
      }
  
      // Save the updated group program
      await groupProgram.save();
  
      res.send('Contestants registered successfully!');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error while registering contestants.');
    }
  });
  
  
  

//registered programs (user) and remains to register
const sectionArr3 = []
router.get('/registeredContestants', async (req, res) => {
  try {
    let searchOptions = {};
    if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i');
  }
  const sectionDataToFind = sectionArr3.length > 0 ? sectionArr3[0] : "super senior";
  const filter = {};

  if (sectionDataToFind) {
    filter.sectionData = sectionDataToFind;
  }
  
  if (searchOptions.name) {
    filter.$or = [
      {name : searchOptions.name},
     {language : searchOptions.name}
    ]
  
  }
 
    const team = req.user;
    const programs = await Program.aggregate([{$match : filter}]);
    const contestants = await ContestentData.find({ user: team.name , sectionData : sectionDataToFind});

    const tableData = programs.map(program => {
      const registeredContestants = contestants.filter(contestant =>
        contestant.programData.some(programData => programData.name === program.name)
      );

      const contestantsWithVerification = registeredContestants.map(contestant => {
        const programData = contestant.programData.find(programData => programData.name === program.name);
        return {
          name: contestant.name,
          verified: programData ? programData.verified : false,
        };
      });

      return {
        program: program,
        contestants: contestantsWithVerification,
      };
    });

    const userMainContentPath = '../partials/user/registeredPrograms.ejs';
    res.render('USER/home.ejs', { tableData,searchOptions: req.query , sectionData: sectionArr3[0], userMainContentPath });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});
//section submission
router.post('/selectsub3', (req,res)=>{
  if(req.body.sectionData){
    sectionArr3.unshift(req.body.sectionData)
    res.redirect('/registeredContestants')
}
})
//registered group program route
const registeredGroupProgramsSection = []
router.get('/registeredGroupPrograms',async (req, res)=>{

 try {

  let searchOptions = {};
 
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i');
  }

    const sectionDataToFind = registeredGroupProgramsSection.length > 0 ? registeredGroupProgramsSection[0] : 'super senior';

    const filter = {};

    if (sectionDataToFind) {
      filter.sectionData = sectionDataToFind;
    }
    
    if (searchOptions.name) {
      filter.$or = [
        {name : searchOptions.name},
       {language : searchOptions.name}
      ]
    
    }
    const groupPrograms = await GroupProgram.aggregate([{$match : filter}]);
    const sectionarr = registeredGroupProgramsSection[0]
    const userMainContentPath = '../partials/user/registeredGroupPrograms.ejs'
    res.render('USER/home.ejs', { groupPrograms , userMainContentPath, searchOptions: req.query , sectionarr});
  } catch (error) {
    res.redirect('/login')
  }
})
router.post("/registeredGroupPrograms/section", (req,res)=>{
  registeredGroupProgramsSection.unshift(
   req.body.sectionData
  )
  
  res.redirect('/registeredGroupPrograms')
})
//add search option on reistered goroup program route 
router.get('/registeredGroupPrograms/:id', async (req, res) => {
  try {
    const id = req.params.id
    const groupPrograms = await GroupProgram.findById(id);
   const selectedProgram =  groupPrograms.registeredTeams.filter(
      t =>  t.name === req.user.name
    )

    const userMainContentPath = '../partials/user/registeredGroupProgramsID.ejs'
   
   
    res.render('USER/home.ejs', { groupPrograms : selectedProgram,id: req.params.id, userMainContentPath, name: req.user.name });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching group programs.');
  }
});
// to remove groups from registered group prgram array
router.post('/removeRegisteredGroup/:groupProgmid/:groupId', async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const groupProgmid = req.params.groupProgmid;

    // Find the group by its ID
    const groupProgram = await GroupProgram.findById(groupProgmid);

    if (groupProgram) {
      groupProgram.registeredTeams = groupProgram.registeredTeams.filter(
        (group) => group._id.toString() !== groupId
      );
      await groupProgram.save();
    } else {
      console.log('Group Program not found');
    }

    res.redirect(`/registeredGroupPrograms/${groupProgmid}`); // Redirect to wherever you want after removing the group
  } catch (error) {
    console.error(error);
    res.status(500).send('Error removing group.');
  }
});






// TO SELECT SECTION OF CONTESTENTES


 router.get('/results', async(req,res)=>{
  
  try {
    const contestants = await ContestentData.find({ user: req.user.name }).lean();
    const programs = await Program.find().lean();

    // Create a map to hold team-wise results
    const teamResultsMap = new Map();

    contestants.forEach((contestant) => {
      contestant.totalPoints = contestant.programData.reduce((total, program) => {
        const matchingProgram = programs.find((p) => p._id.toString() === program.__id.toString());
        
        if (!matchingProgram.published) {
          return total; // Skip this program's points if it's not published
        }
        
        if (program.result && program.result.position && program.result.grade) {
          total += calculatePoints(program.result.position, program.result.grade);
        }
        return total;
      }, 0);

      // Aggregate the total points for each team
      const teamName = req.user.name; // Modify this according to your data structure
      if (!teamResultsMap.has(teamName)) {
        teamResultsMap.set(teamName, 0);
      }
      teamResultsMap.set(teamName, teamResultsMap.get(teamName) + contestant.totalPoints);
    });
  
    // Convert the team results map to an array of objects
    const teamResults = Array.from(teamResultsMap, ([team, totalPoints]) => ({ team, totalPoints }));
      
//COUNT OF TOTAL PUBLISHED PROGRAM RESULTSS


    const final = teamResults[0].totalPoints
    
     const userMainContentPath = '../partials/user/RESULT/showResult.ejs'
     res.render('USER/home.ejs', {contestantData: contestants,final, userMainContentPath: userMainContentPath})
   
  } catch (error) {
    res.redirect('/')
    console.log(error)
  }
 
 })




router.get('/results/contestants', async (req, res) => {
  try {
    const contestants = await ContestentData.find({user : req.user.name}).lean();
    const programs = await Program.find().lean();

    contestants.forEach((contestant) => {
      contestant.totalPoints = contestant.programData.reduce((total, program) => {
        
        const matchingProgram = programs.find((p) => p._id == program.__id)
           //console.log(program.__id == p._id)
         
        if (!matchingProgram.published) {
          return total; // Skip this program's points if it's not published
        }

        if (program.result && program.result.position && program.result.grade) {
          total += calculatePoints(program.result.position, program.result.grade);
        }
        return total;
      }, 0);
    });
    const a = contestants.forEach(c => {
      
    })
    contestants.sort((b, a) => a.totalPoints - b.totalPoints); // Sort in ascending order of totalPoints
    const userMainContentPath = '../partials/user/RESULT/contestantsresult.ejs'
    res.render('USER/home.ejs', { contestants: contestants, userMainContentPath });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching results.');
  }
});

function calculatePoints(position, grade) {
  const positionPoints = { "1": 5, "2": 3, "3": 1 };
  const gradePoints = { "A": 5, "B": 3 };

  return (positionPoints[position] || 0) + (gradePoints[grade] || 0);
}

router.get('/results/contestants/:id', async(req,res)=>{
  try {
    const contestantId = req.params.id;
    const contestant = await ContestentData.findById(contestantId).lean();
    const programs = await Program.find().lean()
    if (!contestant) {
      return res.status(404).send('Contestant not found.');
    }

    // Filter out programs with unpublished results
    const publishedPrograms = contestant.programData.filter(program => {
      const matchingProgram = programs.find(p => p._id == program.__id);
      return matchingProgram.published;
    });
    const userMainContentPath = '../partials/user/RESULT/contestenrbyId.ejs'
    res.render('USER/home.ejs', {
      contestant: contestant,
      programs: publishedPrograms,
      userMainContentPath
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching data.');
  }
})

//group program result
router.get('/group_program', async(req,res)=>{

  const  group_program = await GroupProgram.find()
  try {
     const userMainContentPath = '../partials/user/RESULT/group_Program.ejs'
     res.render('USER/home.ejs', {
      group_program,
      userMainContentPath
    });
  } catch (error) {
    console.error(error)
    res.redirect('/login')
  }
})
router.get('/group_program/:id', async(req,res)=>{
  const id = req.params.id
  const  group_program = await GroupProgram.findById(id)
 const usergroupProgram =  group_program.registeredTeams.find(g => g.name = req.user.name)
 console.log(usergroupProgram)
  try {
     const userMainContentPath = '../partials/user/RESULT/group_Program/group_Programid.ejs'
     res.render('USER/home.ejs', {
      group_program,
      usergroupProgram,
      userMainContentPath
    });
  } catch (error) {
    console.error(error)
    res.redirect('/login')
  }
})


router.get('/publishedProgramCount', async (req, res) => {
  try {
    // Find the count of programs where published is true
    const publishedProgramCount = await Program.countDocuments({ published: true });
    const groupprogram  = await GroupProgram.countDocuments({published : true})
    console.log(publishedProgramCount + groupprogram)
    // Render the count in your view
    // const userMainContentPath = '../partials/user/publishedProgramCount.ejs';
    // res.render('USER/home.ejs', { publishedProgramCount, userMainContentPath });
    res.send('succccccc')
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});
module.exports = router;


//'USER/RESULT/contestantsresult.ejs',
//'/results/contestants'
//contestenrbyId.ejs