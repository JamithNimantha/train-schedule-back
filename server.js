const express = require('express');
const mongoose = require('mongoose');
const db = require('./config/keys').mongoURI;
const port = require('./config/keys').port;
const app = express();

mongoose
    .connect(
        db,
        {
        useNewUrlParser: true,
        useCreateIndex : true
        })
    .then(() => console.log("MongoDB Connected !!!"))
    .catch((err) => console.log(err));

app.get('/',(req, res) => {
    res.send('App Working');
});

app.listen(port, () => {
    console.log(`Server Listening on ${port}`);
});