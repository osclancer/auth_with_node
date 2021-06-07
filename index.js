const express   = require('express');
const app       = express();
const mongoose  = require('mongoose');
const env       = require('dotenv');


// Import Routes
const authRoutes = require('./routes/auth');

env.config();

// Connect To DB
mongoose.connect(process.env.DB_CONNECT, 
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => { console.log('conected To DB'); }
);

// Middlewares
app.use(express.json());


// Route Middlewares
app.use('/api/user', authRoutes);

app.listen(3000, () => console.log('Servire Up & Running On Port: 3000'));