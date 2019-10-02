const express = require('express')
const multer = require('multer')

const app = express()

const upload = multer({
    dest: 'images',
    limits: {
        fileSize: 1000000 //1 MB
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(doc|docx)$/)) {
            return cb(new Error('Please upload a Word document'))
        }

        cb(undefined, true)
    }
})

const errorMiddleware = (req, res, next) => {
    throw new Error('Error from my middleware')
}


app.post('/upload2', errorMiddleware, (req, res,) => {
    res.send()
}, (error, req, res, next) => {
    res.status(400).send()
})

app.post('/upload', upload.single('upload'), (req, res) => {
    res.send()
}, (err, req, res, next) => {
    res.status(400).send({error: err.message})
})

app.listen(1337, () => {
    console.log('App is listening on port 1337')
})