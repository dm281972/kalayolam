const express = require("express");
const router = express.Router();
const contestentData = require("../models/constestents.js")
const programs = require("../models/program.js")

router.get('/', (req,res)=> {
    res.render('public_portal/public_portal.ejs')
} )
router.get('/result/:name', async(req,res)=> {
    const name = req.params.name
    const contestents = await contestentData.find({user : name}).lean()
    const programss = await programs.find().lean()
    const teamresultMap =  new Map()

   contestents.forEach((contestant) => {
    contestant.totalPoints = contestant.programData.reduce((total, program) => {
        const matchingProgram = programss.find((p) => p._id.toString() === program.__id.toString());
         console.log(matchingProgram, contestant.name, program.__id, program.name)
        // if (!matchingProgram.published) {
        //   return total; // Skip this program's points if it's not published
        // }
        
        if (program.result && program.result.position && program.result.grade) {
          total += calculatePoints(program.result.position, program.result.grade);
        }
        return total;
      }, 0);

   
    teamresultMap.set(contestant.totalPoints)
   })
   console.log(teamresultMap)
    res.render('public_portal/teambased.ejs' , {name})
})

function calculatePoints(position, grade) {
    const positionPoints = { "1": 5, "2": 3, "3": 1 };
    const gradePoints = { "A": 5, "B": 3 };
  
    return (positionPoints[position] || 0) + (gradePoints[grade] || 0);
  }
 // this code working perfectly
  router.get('/all_Team_Result', async (req, res) => {
    try {
      const contestants = await contestentData.find().lean();
      const program = await programs.find().lean();
  
      const teamResultsMap = new Map();
  
      contestants.forEach((contestant) => {
        contestant.totalPoints = contestant.programData.reduce((total, prgm) => {
          const matchingProgram = program.find((p) => p._id.toString() === prgm.__id.toString());
          
          if (!matchingProgram.published) {
            return total; // Skip this program's points if it's not published
          }
          
          if (prgm.result && prgm.result.position && prgm.result.grade) {
            total += calculatePoints(prgm.result.position, prgm.result.grade);
          }
          return total;
        }, 0);
  
        const teamName = contestant.user; // Modify this according to your data structure
        if (!teamResultsMap.has(teamName)) {
          teamResultsMap.set(teamName, 0);
        }
        teamResultsMap.set(teamName, teamResultsMap.get(teamName) + contestant.totalPoints);
      });
  
      const teamResults = Array.from(teamResultsMap, ([team, totalPoints]) => ({ team, totalPoints }));
  
     // const userMainContentPath = '../partials/user/RESULT/showResult.ejs';
      res.send(teamResults)
      //res.render('USER/home.ejs', { teamResults, userMainContentPath });
    } catch (error) {
      res.redirect('/');
      console.log(error);
    }
  });
  
  
module.exports = router