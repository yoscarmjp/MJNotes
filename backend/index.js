require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT;
const authRoutes = require('./routes/auth')
const multer = require('multer')

app.use(multer().none());

app.use('/api/auth', authRoutes);

app.listen(port, () =>{
    console.log(`Inicio en el puerto ${port}`)
})