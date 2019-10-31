const request = require('supertest')

const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, userTwoId, userTwo, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

describe('GET /users/me (Read Profile)', () => {
    test('Should return 200 OK if user is authenticated', async () => {
        await request(app)
            .get('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200)
    })

    test('Should return correct user data in response if user is authenticated', async () => {
        const response = await request(app)
            .get('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
        
        const user = await User.findById(userOneId)
        const userJson = JSON.parse(JSON.stringify(user))
        expect(response.body).toStrictEqual(userJson)
    })

    test('Should return 401 if user is unauthenticated', async () => {
        await request(app)
            .get('/users/me')
            .send()
            .expect(401)
    })

    test('Should return authentication error message if user is unauthenticated', async () => {
        const response = await request(app)
            .get('/users/me')
            .send()
        
        const expectedErrorMessage = 'Please authenticate!'
        expect(response.body.error).toEqual(expectedErrorMessage)
    })
    // test('Should get profile for user', async () => {
    //     await request(app)
    //             .get('/users/me')
    //             .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    //             .send()
    //             .expect(200)
    // })
    
    // test('Should NOT get profile for unauthenticated user', async () => {
    //     await request(app)
    //             .get('/users/me')
    //             .send()
    //             .expect(401)
    // })
})

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
    test('Should return 200 OK with existing user', async () => {
        await request(app)
            .post('/users/login')
            .send({
                email: userOne.email,
                password: userOne.password
            })
            .expect(200)
    })

    test('Should generate and save a new authentication token for user', async () => {
        const response = await request(app)
            .post('/users/login')
            .send({
                email: userOne.email,
                password: userOne.password
            })
        
        const user = await User.findById(userOneId)
        const expectedToken =user.tokens[1].token
        
        expect(response.body.token).toEqual(expectedToken)
    })
    
    test('Should return 400 with invalid credentials', async () => {
        await request(app)
                .post('/users/login')
                .send({
                    email: 'not@existing.com',
                    password: '12345as!'
                })
                .expect(400)
    })
})

describe('POST /logout', () => {
    test('Should return 200', async () => {
        await request(app)
            .post('/users/logout')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200)
    })

    test('Should return 401 if user is unauthenticated', async () => {
        await request(app)
        .post('/users/logout')        
        .send()
        .expect(401)
    })

    test('Should return authentication error message if user is unauthenticated', async () => {
        const response = await request(app)
            .post('/users/logout')
            .send()
            
        const expectedErrorMessage = 'Please authenticate!'
        expect(response.body.error).toEqual(expectedErrorMessage)
    })

    test('Should remove user token', async () => {
        await request(app)
            .post('/users/logout')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()

        const user = await User.findById(userOneId)
        expect(user.tokens.length).toEqual(0)
    })
})

describe('POST /users/logoutAll', () => {
    test('Should return 200', async () => {
         await request(app)
            .post('/users/logoutAll')
            .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
            .send()
            .expect(200)
    })

    test('Should remove all tokens from authenticated user', async () => {
        await request(app)
            .post('/users/logoutAll')
            .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
            .send()

        const user = await User.findById(userTwoId)
        expect(user.tokens.length).toEqual(0)
    })

    test('Should return 401 if no user is authenticated', async () => {
        await request(app)
            .post('/users/logoutAll')
            .send()
            .expect(401)
    })

    test('Should return authentication error message if no user is authenticated', async () => {
        const response = await request(app)
            .post('/users/logoutAll')
            .send()
        
        const expectedErrorMessage = 'Please authenticate!'
        expect(response.body.error).toEqual(expectedErrorMessage)
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

    test('Should return 400 with invalid name field', async () => {
        const invalidUpdate = { name: '' }

        await request(app)
            .patch('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send(invalidUpdate)
            .expect(400)
    })

    test('Should return validation message with invalid name field', async () => {
        const invalidUpdate = { name: '' }

        const response = await request(app)
            .patch('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send(invalidUpdate)

        const expectedErrorMessage = 'User validation failed: name: Path `name` is required.'
        expect(response.body.message).toEqual(expectedErrorMessage)
    })

    test('Should return 401 if user is unauthenticated', async () => {
        const validData = {
            name: 'Update',
        }

        await request(app)
            .patch('/users/me')
            .send(validData)
            .expect(401)
    })

    test('Should return authentication error message if user is unauthenticated', async () => {
        const validData = {
            name: 'Update'
        }

        const response = await request(app)
            .patch('/users/me')
            .send(validData)

        const expectedErrorMessage = 'Please authenticate!'
        expect(response.body.error).toEqual(expectedErrorMessage)
    })

    test('Should NOT update user data if user is unauthenticated', async () => {
        const validData = { name : 'Update' }

        await request(app).patch('/users/me').send(validData)

        const user = await User.findOne({name: validData.name})
        expect(user).toBeFalsy()
    })
})

describe('DELETE /users/me (Delete Account)', () => {
    test('Should return 200 with authenticated user', async () => {
        await request(app)
            .delete('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200)
    })

    test('Should delete authenticated user from database', async () => {
       await request(app)
            .delete('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()

        const user = await User.findById(userOneId)
        expect(user).toBeFalsy()
    })
    
    test('Should return 401 if user is unauthenticated', async () => {
        await request(app)
                .delete('/users/me')
                .send()
                .expect(401)
    })

    test('Should NOT delete any users if no user is authenticated', async () => {
        await request(app)
            .delete('/users/me')
            .send()

        const users = await User.find({})
        expect(users.length).toEqual(2)
    })
})

describe('DELETE /users/me/avatar (Delete Avatar)', () => {
    test('Should return 200', async () => {
        await request(app)
            .delete('/users/me/avatar')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200)
    })

    test('Should delete avatar from database', async () => {
        await request(app)
            .delete('/users/me/avatar')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()

        const user = await User.findById(userOneId)
        expect(user.avatar).toBeFalsy()
    })
    
    test('Should return 401 if user is unauthenticated', async () => {
        await request(app)
            .delete('/users/me/avatar')
            .send()
            .expect(401)
    })

    test('Should return authentication error message if user is unauthenticated', async () => {
        const response = await request(app)
            .delete('/users/me/avatar')
            .send()

        const expectedErrorMessage = 'Please authenticate!'
        expect(response.body.error).toEqual(expectedErrorMessage) 
    })
})

describe('File uploads', () => {
    test('Should return 200 with successful upload', async () => {
        await request(app)
            .post('/users/me/avatar')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .attach('avatar', 'tests/fixtures/profile-pic.jpg')
            .expect(200)
    })

    test('Should upload avatar image', async () => {
        await request(app)
            .post('/users/me/avatar')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        
        const user = await User.findById(userOneId)
        expect(user.avatar).toEqual(expect.any(Buffer))
    })

    test('Should return 400 with invalid key', async () => {
        await request(app)
            .post('/users/me/avatar')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .attach('invalidKey', 'tests/fixtures/profile-pic.jpg')
            .expect(400)
    })

    test('Should return validation error with invalid key', async () => {
        const response = await request(app)
            .post('/users/me/avatar')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .attach('invalidKey', 'tests/fixtures/profile-pic.jpg')
        
        const expectedErrorMessage = 'Unexpected field'
        expect(response.body.error).toEqual(expectedErrorMessage)
    })

    test('Should return 400 if file is not an image', async () => {
        await request(app)
            .post('/users/me/avatar')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .attach('avatar', 'tests/fixtures/test-txt-file.txt')
            .expect(400)
    })

    test('Should return validation error if file is not an image', async () => {
        const response = await request(app)
            .post('/users/me/avatar')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .attach('avatar', 'tests/fixtures/test-txt-file.txt')
        
        const expectedErrorMessage = 'Please upload an image!'
        expect(response.body.error).toEqual(expectedErrorMessage)
    })

    test('Should return 400 if file is larger than 1MB', async () => {
        await request(app)
            .post('/users/me/avatar')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .attach('avatar', 'tests/fixtures/10-mb.jpg')
            .expect(400)
    })

    test('Should return validation error if file is larger than 1MB', async () => {
        const response = await request(app)
            .post('/users/me/avatar')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .attach('avatar', 'tests/fixtures/10-mb.jpg')
        
        const expectedErrorMessage = 'File too large'
        expect(response.body.error).toEqual(expectedErrorMessage)
    })

    test('Should return 400 if no file is sent', async () => {
        await request(app)
            .post('/users/me/avatar')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .attach('avatar', '')
            .expect(400)
    })

    test('Should return validation error message if no file is sent', async () => {
        const response = await request(app)
            .post('/users/me/avatar')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .attach('avatar','')

        const expectedErrorMessage = 'No files sent!';
        expect(response.body.error).toEqual(expectedErrorMessage)
    })
})

