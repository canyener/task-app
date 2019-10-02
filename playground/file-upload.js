const express = require('express')
const multer = require('multer')

const app = express()

const upload = multer({
    dest: 'images' 
})

app.post('/upload', upload.single('upload'), (req, res) => {
    res.send()
})

app.listen(1337, () => {
    console.log('App is listening on port 1337')
})