const request = require('supertest')
const app = require('../src/app')

const User = require('../src/models/user')

beforeEach( async () => {
    await User.deleteMany()
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