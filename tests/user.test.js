const request = require('supertest')

const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

describe('POST /users (Signup)', () => {
    test('Should return 201 with valid user data', async () => {
        const validUser = {
            name: 'Can',
            email: 'can@example.com',
            password: 'cancan1!'
        }

        await request(app)
            .post('/users')
            .send(validUser)
            .expect(201)
    })

    test('Should save valid user to database', async () => {

        const validUser = {
            name: 'Can',
            email: 'can@example.com',
            password: 'cancan1!'
        }

        const response = await request(app)
            .post('/users')
            .send(validUser)

        const user = await User.findById(response.body.user._id)
        expect(user).toBeTruthy() 
    })

    test('Should return correct user data in response', async () => {
        const validUser = {
            name: 'Can',
            email: 'can@example.com',
            password: 'cancan1!'
        }

        const response = await request(app)
            .post('/users')
            .send(validUser)

        const user = await User.findById(response.body.user._id)

        const expected = {
            user: {
                name: 'Can',
                email: 'can@example.com'
            },
            token: user.tokens[0].token
        }

        expect(response.body).toMatchObject(expected)
    })

    test('Should NOT save plain text password to database', async () => {
        const validUser = {
            name: 'Can',
            email: 'can@example.com',
            password: 'cancan1!'
        }

        const response = await request(app)
            .post('/users')
            .send(validUser)

        const user = User.findById(response.body.user._id)

        expect(user.password).not.toEqual('cancan1!')
    })

    test('Should return 400 with empty user name', async () => {
        const invalidUser = {
            name: '',
            email: 'can@example.com',
            password: 'cancan1!'
        }

        await request(app)
            .post('/users')
            .send(invalidUser)
            .expect(400)            
    })

    test('Should return validation message with empty user name', async () => {
        const invalidUser = {
            name: '',
            email: 'can@example.com',
            password: 'cancan1!'
        }

        const response = await request(app)
            .post('/users')
            .send(invalidUser)

        const expectedErrorMessage = 'User validation failed: name: Path `name` is required.'
        expect(response.body.message).toEqual(expectedErrorMessage)
    })

    test('Should NOT save user with empty name to database' , async () => {
        const invalidUser = {
            name: '',
            email: 'can@example.com',
            password: 'cancan1!'
        }

        await request(app)
            .post('/users')
            .send(invalidUser)

        const user = await User.findOne({email: invalidUser.email})
        expect(user).toBeFalsy()
    })

    test('Should return 400 with empty email', async () => {
        const invalidUser = {
            name: 'Can',
            email: '',
            password: 'cancan1!'
        }

        await request(app)
            .post('/users')
            .send(invalidUser)
            .expect(400)
    })

    test('Should return validation message with empty email', async () => {
        const invalidUser = {
            name: 'Can',
            email: '',
            password: 'cancan1!'
        }

        const response = await request(app)
            .post('/users')
            .send(invalidUser)

        const expectedErrorMessage = 'User validation failed: email: Path `email` is required.'
        expect(response.body.message).toEqual(expectedErrorMessage)
    })

    test('Should NOT save user to database if email is empty', async () => {
        const invalidUser = {
            name: 'Can',
            email: '',
            password: 'cancan1!'
        }

        await request(app)
            .post('/users')
            .send(invalidUser)
        
        const users = await User.find({})
        expect(users.length).toEqual(2)
    })

    test('Should return 400 if email is invalid', async () => {
        const invalidUser = {
            name: 'can',
            email: 'invalidmail.com',
            password: 'cancan1!'
        }

        await request(app)
            .post('/users')
            .send(invalidUser)
            .expect(400)
    })

    test('Should return validation message if email is invalid', async () => {
        const invalidUser = {
            name: 'can',
            email: 'can.invalidmail.com',
            password: 'cancan1!'
        }

        const response = await request(app)
            .post('/users')
            .send(invalidUser)

        const expectedErrorMessage = 'User validation failed: email: Email is invalid'
        expect(response.body.message).toEqual(expectedErrorMessage)
    })

    test('Should NOT save user to database if email is invalid', async () => {
        const invalidUser = {
            name: 'can',
            email: 'can.invalidmail.com',
            password: 'cancan1!'
        }

        await request(app)
            .post('/users')
            .send(invalidUser)

        const user = await User.findOne({email: invalidUser.email})
        expect(user).toBeFalsy()
    })

    test('Should return validation message with empty password', async () => {
        const invalidUser = {
            name: 'Can',
            email: 'can@example.com',
            password: ''
        }

        const response = await request(app)
            .post('/users')
            .send(invalidUser)

        const expectedErrorMessage = 'User validation failed: password: Path `password` (``) is shorter than the minimum allowed length (7).'
        expect(response.body.message).toEqual(expectedErrorMessage)
    })

    test('Should NOT save user to database with empty password', async () => {
        const invalidUser = {
            name: 'Can',
            email: 'can@example.com',
            password: ''
        }

        await request(app)
            .post('/users')
            .send(invalidUser)

        const user = await User.findOne({email: invalidUser.email})
        expect(user).toBeFalsy()
    })

    test('Should return validation message if password minlength is less than 7', async () => {
        const invalidUser = {
            name: 'Can',
            email: 'can@example.com',
            password: 'test'
        }

        const response = await request(app)
            .post('/users')
            .send(invalidUser)

        const expectedErrorMessage = 'User validation failed: password: Path `password` (`test`) is shorter than the minimum allowed length (7).'
        expect(response.body.message).toEqual(expectedErrorMessage)
    })

    test('Should NOT save user to database if password length is less than 7', async () => {
        const invalidUser = {
            name: 'Can',
            email: 'can@example.com',
            password: 'tstpwd'            
        }

        await request(app).post('/users').send(invalidUser)

        const user = await User.findOne({email: invalidUser.email})
        expect(user).toBeFalsy()
    })

    test('Should return validation error if password contains word "password"', async () => {
        const invalidUser = {
            name : 'Can',
            email: 'can@example.com',
            password: 'password1234'
        }

        const response = await request(app)
            .post('/users')
            .send(invalidUser)

        const expectedErrorMessage = 'User validation failed: password: Password cannot contain the word \"password\"'
        expect(response.body.message).toEqual(expectedErrorMessage)
    })

    test('Should NOT save user to database if password contains word "password"', async () => {
        const invalidUser = {
            name: 'Can',
            email: 'can@example.com',
            password: 'password1234'
        }

        await request(app).post('/users').send(invalidUser)

        const user = await User.findOne({email: invalidUser.email})
        expect(user).toBeFalsy()
    })

    test('Should save age to database as 0 if not sent in request', async () => {
        const validUser = {
            name: 'Can',
            email: 'can@example.com',
            password: 'cancan1!'
        }

        await request(app)
            .post('/users')
            .send(validUser)

        const user = await User.findOne({email: validUser.email})
        expect(user.age).toEqual(0)
    })

    test('Should return validation message if age is not Number', async () => {
        const invalidUser = {
            name: 'Can',
            email: 'can@example.com',
            password: 'cancan1!',
            age: "invalid"
        }

        const response = await request(app)
            .post('/users')
            .send(invalidUser)
        
        const expectedErrorMessage = 'User validation failed: age: Cast to Number failed for value \"invalid\" at path \"age\"'
        expect(response.body.message).toEqual(expectedErrorMessage)
    })

    test('Should NOT save user to database if age is not Number', async () => {
        const invalidUser = {
            name: 'Can',
            email: 'can@example.com',
            password: 'cancan1!',
            age: "invalid"
        }

        await request(app)
            .post('/users')
            .send(invalidUser)

        const user = await User.findOne({email: invalidUser.email})
        expect(user).toBeFalsy()
    })

    test('Should return validation message if age is a negative number', async () => {
        const invalidUser = {
            name: 'Can',
            email: 'can@example.com',
            password: 'cancan1!',
            age: -1
        }

        const response = await request(app)
            .post('/users')
            .send(invalidUser)
        
        const expectedErrorMessage = 'User validation failed: age: Age must be a positive number'
        expect(response.body.message).toEqual(expectedErrorMessage)
    })

    test('Should NOT save user to database if age is a negative number', async () => {
        const invalidUser = {
            name: 'Can',
            email: 'can@example.com',
            password: 'cancan1!',
            age: -1
        }

        await request(app)
            .post('/users')
            .send(invalidUser)

        const user = await User.findOne({email: invalidUser.email})
        expect(user).toBeFalsy()
    })

    test('Should save age as null to database with empty string', async () => {
        const validUser = {
            name: 'Can',
            email: 'can@example.com',
            password: 'cancan1!',
            age: ''
        }

        await request(app)
            .post('/users')
            .send(validUser)

        const user = await User.findOne({email: validUser.email})
        expect(user.age).toBeNull()
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
