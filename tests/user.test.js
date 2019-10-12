const request = require('supertest')

const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

describe('POST /users (Signup)', () => {
    test('Should signup a new user', async () => {
        const response = await request(app)
                .post('/users')
                .send({
                    name: 'Can Yener',
                    email: 'can@example.com',
                    password: 'cancan1!'
                })
                .expect(201)

        //Assert that the database was changed correctly
        const user = await User.findById(response.body.user._id)
        expect(user).not.toBeNull()

        //Assertions about the response
        expect(response.body).toMatchObject({
            user: {
                name: 'Can Yener',
                email: 'can@example.com'
            },
            token: user.tokens[0].token
        })

        //Assert that password is not stored as plain text in database
        expect(user.password).not.toBe('cancan1!')
    })
})

describe('POST /users/login (Login)', () => {
    test('Should login existing user', async () => {
        const response = await request(app)
                .post('/users/login')
                .send({
                    email: userOne.email,
                    password: userOne.password
                })
                .expect(200)

         //Assert that the database was changed correctly
        const user = await User.findById(userOneId)
        expect (response.body.token).toBe(user.tokens[1].token)
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
})

describe('GET /users/me (Read Profile)', () => {
    test('Should get profile for user', async () => {
        await request(app)
                .get('/users/me')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200)
    })
    
    test('Should NOT get profile for unauthenticated user', async () => {
        await request(app)
                .get('/users/me')
                .send()
                .expect(401)
    })
})

describe('DELETE /users/me (Delete Account)', () => {
    test('Should delete account for user', async () => {
       await request(app)
            .delete('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200)

        //Assert that the database was changed correctly
        const user = await User.findById(userOneId)
        expect(user).toBeFalsy()
    })
    
    test('Should NOT delete account for unauthenticated user', async () => {
        await request(app)
                .delete('/users/me')
                .send()
                .expect(401)
    })
})

describe('PATCH /users/me', () => {
    test('Should update valid user fields', async () => {

        const updatedUser = {
            name: 'Updated',
            email: 'updated@example.com'
        }

        const response = await request(app)
            .patch('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send(updatedUser)
            .expect(200)

        //Assert that the database was changed correctly
        const user = await User.findById(userOneId)
        expect(user).toMatchObject(updatedUser)

        //Assert that the response is correct
        expect(response.body).toMatchObject(updatedUser)
    })

    test('Should NOT update invalid user fields', async () => {
        const userWithInvalidFields = {
            name: 'Test user',
            location: 'Invalid location'
        }
        
        const response = await request(app)
            .patch('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send(userWithInvalidFields)
            .expect(400)

            //Assert that the database changed correctly
            const user = await User.findById(userOneId)
            expect(user.location).toBeFalsy()

            //Asser that the response is correct
            expect(response.body.error).toBe('Invalid updates!')
    })
})

describe('File uploads', () => {
    test('Should upload avatar image', async () => {
        await request(app)
            .post('/users/me/avatar')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .attach('avatar', 'tests/fixtures/profile-pic.jpg')
            .expect(200)
        
        const user = await User.findById(userOneId)
        expect(user.avatar).toEqual(expect.any(Buffer))
    })
})
