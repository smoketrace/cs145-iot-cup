const express = require("express");
const router = express.Router()


let sensors = [
  { id: 1, readings: [5,3,5,2,5]}, 
  { id: 2, readings: [5,13,6,3,6]}, 
  { id: 3, readings: [6,1,3,6,3]}, 
]


router.get('/', (request, response) => {
  console.log("GET api/sensors");
  response.send(sensors)
})

router.get('/:id', (req, res) => {
  // req.params to get req fields  
  const sensor = sensors.find(c => c.id === parseInt(req.params.id));

  // if no course (error), send 404
  if (!sensor) {
    res.status(404).send('The sensor with the given ID was not found')
  }
  res.send(sensor);
});


module.exports = router;