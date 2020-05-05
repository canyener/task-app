const request = require('supertest')

const app = require('../src/app')
const { validFormatToken, setupDatabase, disconnectFromDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)
afterAll(disconnectFromDatabase)

describe('Authentication Middleware', () => {
    test('Should return 401 if token is valid but user not found in database', async () => {
        
        await request(app)
                .get('/users/me')
                .set('Authorization', `Bearer ${validFormatToken}`)
                .send()
                .expect(401)
    })

    test('Should return authentication error message if token is valid but user not found in database', async () => {
         const response = await request(app)
            .get('/users/me')
            .set('Authorization', `Bearer ${validFormatToken}`)
            .send()
        
        const expectedErrorMessage = 'Please authenticate!'
        expect(response.body.error).toEqual(expectedErrorMessage)
    })
})