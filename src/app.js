const express = require('express');

require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();

app.use(express.json());
app.use(userRouter); // user routes
app.use(taskRouter); // tasks routes

module.exports = app;
