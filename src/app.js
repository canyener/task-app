require('../config/env.config')
const express = require('express')
require('./db/mongoose')

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()

app.use(express.json())
app.use('/users', userRouter)
app.use('/tasks', taskRouter)

module.exports = app