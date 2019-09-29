const express = require('express')
require('./db/mongoose')

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT || 3000
const inMaintenance = false

app.use((req, res, next) => {
    if (inMaintenance) {
        res.status(503).send('Site is currently down. Check back soon!')
    } else {
        next()
    }
})

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})
