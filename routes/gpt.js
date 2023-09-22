// Assuming you have imported the required modules and models for Mongoose
const Program = require('./models/Program');
const ContestentData = require('./models/ContestentData');

router.get('/addResults/:id', async (req, res) => {
  try {
    // Find the program by ID from the "Program" collection
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    // Search for contestant data containing the program ID in the "programData" array
    const contestentData = await ContestentData.findOne({
      'programData._id': req.params.id,
    });

    if (!contestentData) {
      return res.status(404).json({ error: 'Contestent data not found' });
    }

    // Find the specific programData object that matches the program ID
    const programData = contestentData.programData.find(
      (data) => data._id.toString() === req.params.id
    );

    if (!programData) {
      return res.status(404).json({ error: 'Program data not found in contestant data' });
    }

    // Extract the program name from the programData object
    const programName = programData.name;

    // Now you have the program name and can pass it to the render function
    res.render('ADMIN/1-RESULTS/addResult.ejs', { programName, programs: program });
  } catch (error) {
    // Handle any potential errors
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});