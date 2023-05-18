const express = require('express');
const Joi = require('joi');       // joi for input validation
const http = require('http');
const app = express();
const cors = require('cors')


app.use(cors())
const PORT = process.env.PORT || 3000;
app.use(express.json());


const phone_directory = require('./routes/phone_directory')
app.use('/api/phones', phone_directory);

const sensors = require('./routes/sensors')
app.use('/api/sensors', sensors);



app.get('/', (req, res) => {
  res.send('Hello worlddddd');
})


app.listen(PORT, () => console.log(`Server is now running at ${PORT}`));
