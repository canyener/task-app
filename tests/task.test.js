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
    setupDatabase,
    disconnectFromDatabase
} = require('./fixtures/db')

beforeEach(setupDatabase)
afterAll(disconnectFromDatabase)

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
        
        expect(response.body.length).toEqual(7)
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

    describe('#Filtering - Sorting - Pagination', () => {
        test('Should filter tasks by completed', async () => {
            const response = await request(app)
                .get('/tasks?completed=true')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
            
            expect(response.body.length).toEqual(2)
        })

        test('Should ignore invalid filter keys', async () => {
            const response = await request(app)
                .get('/tasks?invalid=123asd')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()

            expect(response.body.length).toEqual(7)
        })

        test('Should limit tasks correctly', async () => {
            const response = await request(app)
                .get('/tasks?limit=4')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()

            expect(response.body.length).toEqual(4)
        })

        test('Should skip tasks correctly', async () => {
            const response = await request(app)
                .get('/tasks?skip=2&limit=1')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
            
            expect(response.body.length).toEqual(1)
            expect(response.body[0].description).toEqual('Test Task Four Description')
        })

        test('Should ignore invalid sort patterns', async () => {
            const response = await request(app)
                .get('/tasks?sortBy=invalid:::desc')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()

            expect(response.body[0].description).toEqual('Test Task One Description')
        })

        test('Should sort tasks correctly by descending by createdAt', async () => {
            const response = await request(app)
                .get('/tasks?sortBy=createdAt:desc')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()

            const tasks = await Task.find({owner: userOneId}).sort({createdAt: -1})
            const expectedResult = JSON.parse(JSON.stringify(tasks))
            expect(response.body).toStrictEqual(expectedResult)
        })
    })
})

describe('GET /tasks/:id', () => {
    test('Should return 200 with valid request', async () => {
        await request(app)
            .get(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200)
    })

    test('Should return correct task in response', async () => {
        const response = await request(app)
            .get(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()

        const task = await Task.findById(taskOne._id)
        const expectedResult = JSON.parse(JSON.stringify(task))
        
        expect(response.body).toStrictEqual(expectedResult)
    })

    test('Should return 204 with task id owned by other users', async () => {
        await request(app)
            .get(`/tasks/${taskThree._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(204)
    })

    test('Should not return task owned by other users', async () => {
        const response = await request(app)
            .get(`/tasks/${taskThree._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
        
        expect(response.body).toEqual({})
    })

    test('Should return 500 with invalid object id', async () => {
        await request(app)
            .get('/tasks/asd1234')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(500)
    })

    test('Should return 204 if task not found in database', async () => {
        await request(app)
            .get(`/tasks/${validObjectId}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(204)
    })

    test('Should return 401 if user is unauthenticated', async () => {
        await request(app)
            .get(`/tasks/${taskOne._id}`)
            .send()
            .expect(401)
    })

    test('Should return authentication error message if user is unauthenticated', async () => {
        const response = await request(app)
            .get(`/tasks/${taskOne._id}`)
            .send()
        
        const expectedErrorMessage = 'Please authenticate!'
        expect(response.body.error).toEqual(expectedErrorMessage)
    })
})

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
        expect(tasks.length).toEqual(8)
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
        expect(tasks.length).toEqual(8)
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

    test('Should return validation error message with invalid completed field', async () => {
        const response = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Test task',
                completed: 'invalid'
            })
        
        const expectedErrorMessage = 'Task validation failed: completed: Cast to Boolean failed for value \"invalid\" (type string) at path \"completed\"'
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

    test('Should return 204 with tasks owned by other users', async () => {
        await request(app)
            .patch(`/tasks/${taskThree._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Updated task',
                completed: true
            })
            .expect(204)
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

    test('Should return 400 if description is empty', async () => {
        await request(app)
            .patch(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: ''
            })
            .expect(400)
    })
    
    test('Should return validation error if description is empty', async () => {
        const response = await request(app)
            .patch(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: ''
            })

        const expectedErrorMessage = 'Task validation failed: description: Path `description` is required.'
        expect(response.body.message).toEqual(expectedErrorMessage)
    })

    test('Should NOT update task if description is empty', async () => {
        await request(app)
            .patch(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: ''
            })
        
        const task = await Task.findById(taskOne._id)
        expect(task.description).not.toEqual('')
    })

    test('Should trim description before saving', async () => {
        await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: '     Updated task '
        })

        const task = await Task.findById(taskOne._id)
        expect(task.description).toEqual('Updated task')
    })

    test('Should return 400 with invalid completed property', async () => {
        await request(app)
            .patch(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Updated task',
                completed: 'invalid'
            })
            .expect(400)
    })

    test('Should return validation error message with invalid completed property', async () => {
        const response = await request(app)
            .patch(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Updated task',
                completed: 'invalid'
            })
        const expectedErrorMessage = 'Task validation failed: completed: Cast to Boolean failed for value \"invalid\" (type string) at path \"completed\"'
        expect(response.body.message).toEqual(expectedErrorMessage)
    })

    test('Should return 400 with invalid object id', async () => {
        await request(app)
            .patch('/tasks/asde1234')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Updated task'
            })
            .expect(400)
    })
    
    test('Should return 204 if object id is valid but task not found in database', async () => {
        await request(app)
            .patch(`/tasks/${validObjectId}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)  
            .send({
                description: 'Updated task'
            })
            .expect(204)
    })

    test('Should return 400 if invalid fields sent in request', async () => {
        await request(app)
            .patch(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Updated task',
                invalidField: 'invalid'
            })
            .expect(400)
    })

    test('Should return error message if invalid fields sent in request', async () => {
        const response = await request(app)
            .patch(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Updated task',
                invalidField: 'invalid'
            })
        
        const expectedErrorMessage = 'Invalid updates!'
        expect(response.body.error).toEqual(expectedErrorMessage)
    })

    test('Should NOT update task if invalid fields sent in request', async () => {
        await request(app)
            .patch(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Updated task',
                invalidField: 'invalid'
            })
        
        const task = await Task.findById(taskOne._id)
        expect(task.description).not.toEqual('Updated task')
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

    test('Should return 204 if task owner is not authenticated user', async () => {
        await request(app)
            .delete(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
            .send()
            .expect(204)
    })

    test('Should NOT delete tasks owned by other users', async () => {
        await request(app)
            .delete(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userTwo.tokens[0].token}`) 
            .send()
            
        const task = await Task.findById(taskOne._id)
        expect(task).toBeTruthy()
    })

    test('Should return 204 with valid object id that is not in database', async () => {
        await request(app)
            .delete(`/tasks/${validObjectId}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(204)
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