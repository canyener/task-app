const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const app = require('../src/app')
const User = require('../src/models/user')

const userOneId = new mongoose.Types.ObjectId()

const userOne = {
    _id: userOneId,
    name: 'Cem Yener',
    email: 'cem@example.com',
    password: 'cemcem1!',
    tokens: [{
        token: jwt.sign({_id: userOneId}, proces.env.JWT_SECRET)
    }]
}

beforeEach( async () => {
    await User.deleteMany()
    await new User(userOne).save()
})

test('Should signup a new user', async () => {
    await request(app)
            .post('/users')
            .send({
                name: 'Can Yener',
                email: 'can@example.com',
                password: 'cancan1!'
            })
            .expect(201)
})

test('Should login existing user', async () => {
    await request(app)
            .post('/users/login')
            .send({
                email: userOne.email,
                password: userOne.password
            })
            .expect(200)
})

test('Should NOT login nonexistent user', async () => {
    await request(app)
            .post('/users/login')
            .send({
                email: 'not@existing.com',
                password: '12345as!'
            })
            .expect(400)
})