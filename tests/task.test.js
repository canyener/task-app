const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { 
    validObjectId,
    userOneId, 
    userOne, 
    userTwo, 
    taskOne, 
    taskTwo,
    taskThree,
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
    test('Should return 200 if user is authenticated', async () => {
        await request(app)
            .get('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200)
    })

    test('Should fetch tasks of authenticated user', async () => {
        const response = await request(app)
            .get('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
        
        expect(response.body.length).toEqual(2)
    })

    test('Should return 401 if user is unauthenticated', async () => {
        await request(app)
            .get('/tasks')
            .send()
            .expect(401)
    })

    test('Should return authentication error if user is unauthenticated', async () => {
        const response = await request(app)
            .get('/tasks')
            .send()

        const expectedErrorMessage = 'Please authenticate!'
        expect(response.body.error).toEqual(expectedErrorMessage)
    })
})

describe('DELETE /tasks/:id', () => {
    test('Should return 200 if the owner is authenticated user', async () => {
        await request(app)
            .delete(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200)
    })

    test('Should delete task from database if the owner is authenticated user', async () => {
        await request(app)
            .delete(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()

        const task = await Task.findById(taskOne._id)
        expect(task).toBeFalsy()
    })

    test('Should return deleted task in response', async () => {
        const task = await Task.findById(taskOne._id)

        const expectedResponse = {
            _id: task._id.toHexString(),
            description: task.description,
            completed: task.completed,
            owner: task.owner.toHexString()
        }

        const response = await request(app)
            .delete(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()

        expect(response.body).toMatchObject(expectedResponse)
    })

    test('Should return 404 if task owner is not authenticated user', async () => {
        await request(app)
            .delete(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
            .send()
            .expect(404)
    })

    test('Should NOT delete tasks owned by other users', async () => {
        await request(app)
            .delete(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userTwo.tokens[0].token}`) 
            .send()
            
        const task = await Task.findById(taskOne._id)
        expect(task).toBeTruthy()
    })

    test('Should return 404 with valid object id that is not in database', async () => {
        await request(app)
            .delete(`/tasks/${validObjectId}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(404)
    })

    test('Should return 500 with invalid object id', async () => {
        await request(app)
            .delete('/tasks/1234')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(500)
    })

    test('Should return 401 if no user is authenticated', async () => {
        await request(app)
            .delete(`/tasks/${taskOne._id}`)
            .send()
            .expect(401)
    })

    test('Should return authentication error message if no user is authenticated', async () => {
        const response = await request(app)
            .delete(`/tasks/${taskOne._id}`)
            .send()
        
        const expectedErrorMessage = 'Please authenticate!'
        expect(response.body.error).toEqual(expectedErrorMessage)
    })

    test('Should NOT delete task if no user is authenticated', async () => {
        await request(app)
            .delete(`/tasks/${taskOne._id}`)
            .send()

        const task = await Task.findById(taskOne._id)
        expect(task).toBeTruthy()
    })
})

describe('PATCH /tasks/:id', () => {
    test('Should return 200 with valid request', async () => {
        await request(app)
            .patch(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Updated task'
            })
            .expect(200)
    })

    test('Should return updated task in response', async () => {
        const response = await request(app)
            .patch(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Updated task'
            })
        
        const expectedTask = {
            description: 'Updated task',
            completed: false,
            owner: userOneId.toHexString()
        }

        expect(response.body).toMatchObject(expectedTask)
    })

    test('Should update task in database', async () => {
        await request(app)
            .patch(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Updated task',
                completed: true
            })
        
        const expectedTask = {
            description: 'Updated task',
            completed: true,
            owner: userOneId
        }

        const task = await Task.findById(taskOne._id)
        expect(task).toMatchObject(expectedTask)
    })    

    test('Should return 404 with tasks owned by other users', async () => {
        await request(app)
            .patch(`/tasks/${taskThree._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Updated task',
                completed: true
            })
            .expect(404)
    })

    test('Should NOT update tasks owned by other users', async () => {
        await request(app)
            .patch(`/tasks/${taskThree._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Updated task'
            })

        const task = await Task.findById(taskThree._id)
        expect(task.description).not.toEqual('Updated task')
    })    

    test('Should NOT update completed property if not sent in request', async () => {
        await request(app)
            .patch(`/tasks/${taskTwo._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Updated task'
            })
        
        const task = await Task.findById(taskTwo._id)
        expect(task.completed).toEqual(true)
    })

    test('Should return 401 if user is unauthenticated', async () => {
        await request(app)
            .patch(`/tasks/${taskOne._id}`)
            .send({
                description: 'Updated task'
            })
            .expect(401)
    })

    test('Should return authentication error if user is unauthenticated', async () => {
        const response = await request(app)
            .patch(`/tasks/${taskOne._id}`)
            .send({
                description: 'Updated task'
            })
        
        const expectedErrorMessage = 'Please authenticate!'
        expect(response.body.error).toEqual(expectedErrorMessage)
    })
})
