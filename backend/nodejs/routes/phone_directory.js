const express = require("express");
const router = express.Router()


let phone_directory = [
  { id: 0, name: "Jelly", phone_number: "09090909091"}, 
  { id: 1, name: "Eyron", phone_number: "01234567890"}, 
  { id: 2, name: "Hance", phone_number: "95285927563"}, 
  { id: 3, name: "Ellis", phone_number: "85175983179"}, 
  { id: 4, name: "Erick", phone_number: "18395189318"}, 
]


router.get('/', (request, response) => {
  console.log("GET api/phones");
  response.send(phone_directory)
})

router.get('/:id', (req, res) => {
  // req.params to get req fields  
  const phone = phone_directory.find(c => c.id === parseInt(req.params.id));

  // if no course (error), send 404
  if (!phone) {
    res.status(404).send('The phone with the given ID was not found')
  }
  res.send(phone);
});



module.exports = router;