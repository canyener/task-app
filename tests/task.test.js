const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { 
    userOneId, 
    userOne, 
    userTwo, 
    taskOne, 
    setupDatabase
} = require('./fixtures/db')

beforeEach(setupDatabase)

describe('POST /tasks', () => {

    test('Should return 201 with valid request' , async () => {
        await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Test task'
            })
            .expect(201)
    })

    test('Should return correct owner and completed properties in response', async () => {
        const response = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Test task'
            })

        expect(response.body).toMatchObject({
            description: 'Test task',
            completed: false,
            owner: userOneId.toHexString()
        })
    })

    test('Should set completed to false in database if not sent in request', async () => {
        await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Test task'
            })
        
        const task = await Task.findOne({ description: 'Test task' })
        expect(task.completed).toEqual(false)
    })

    test('Should save owner as authenticated user to database', async () => {
        await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description : 'Test task'
            })

        const task = await Task.findOne({ description: 'Test task' })
        expect(task.owner).toEqual(userOneId)
    })

    test('Should save correct completed property to database if sent in request', async () => {
        await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Test task',
                completed: true
            })
        
        const task = await Task.findOne({ description: 'Test task' })
        expect(task.completed).toEqual(true)
    })

    test('Should return 400 with empty object', async () => {
        await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({})
            .expect(400)
    })

    test('Should return validation error message for "description" property with empty object', async () => {
        const response = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({})
        
        const expectedErrorMessage = 'Task validation failed: description: Path `description` is required.'
        expect(response.body.message).toEqual(expectedErrorMessage)
    })

    test('Should NOT save empty object to database', async () => {
        await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({})

        const tasks = await Task.find({})
        expect(tasks.length).toEqual(3)
    })

    test('Should return 400 with empty description', async () => {
        await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: ''
            })
            .expect(400)
    })

    test('Should return validation error message for "description" property if description is empty', async () => {
        const response = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: ''
            })

            const expectedErrorMessage = 'Task validation failed: description: Path `description` is required.'
            expect(response.body.message).toEqual(expectedErrorMessage)
    })

    test('Should NOT save task with empty description to database', async () => {
        await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: ''
            })
        
        const tasks = await Task.find({})
        expect(tasks.length).toEqual(3)
    })

    
    test('Should ignore invalid fields in request', async () => {
        await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Test task',
                invalidField: 1234
            })
        
        const task = await Task.findOne({ description: 'Test task' })
        expect(task.description).toEqual('Test task')
        expect(task.invalidField).toBeFalsy()
    })

    test('Should return 400 with invalid completed field', async () => {
        await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Test task',
                completed: 'invalid'
            })
            .expect(400)
    })

    test('Should return 400 with invalid completed field', async () => {
        await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Test task',
                completed: 'invalid'
            })
            .expect(400)
    })

    test('Should return validation error message with invalid completed field', async () => {
        const response = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Test task',
                completed: 'invalid'
            })
        
        const expectedErrorMessage = 'Task validation failed: completed: Cast to Boolean failed for value \"invalid\" at path \"completed\"'
        expect(response.body.message).toEqual(expectedErrorMessage)
    })

    test('Should NOT save task with invalid completed property to database', async () => {
        await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Test task',
                completed: 'invalid'
            })

        const task = await Task.findOne({ description: 'Test task' })
        expect(task).toBeFalsy()
    })

    test('Should return 401 if user is unauthenticated', async () => {
        await request(app)
            .post('/tasks')
            .send({
                description: 'Test task'
            })
            .expect(401)
    })
    
    test('Should return authentication error message if user is unauthenticated', async () => {
        const response = await request(app)
            .post('/tasks')
            .send({
                description: 'Tesk task'
            })

        const expectedErrorMessage = 'Please authenticate!'
        expect(response.body.error).toEqual(expectedErrorMessage)
    })

    test('Should NOT save task to database if user is unauthenticated', async () => {
        await request(app)
            .post('/tasks')
            .send({
                description: 'Test task'
            })
        
        const task = await Task.findOne({ description: 'Test task' })
        expect(task).toBeFalsy()
    })
})

describe('GET /tasks', () => {
    test('Should fetch user tasks', async () => {
        const response = await request(app)
            .get('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200)
        
        expect(response.body.length).toEqual(2)
    })
})

describe('DELETE /tasks/:id', () => {
    test('Should not delete tasks owned by another user', async () => {
        await request(app)
            .delete(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
            .send()
            .expect(404)

        //Assert task is still in database
        const task = await Task.findById(taskOne._id)
        expect(task).toBeTruthy()
    }) 
})
