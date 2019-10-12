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
    test('Should create task for user', async () => {
        const response = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'Test description'
            })
            .expect(201)
    
        //Assert that task is inserted
        const task = await Task.findById(response.body._id)
        expect(task).toBeTruthy()
    
        //Assert that completed property is false
        expect(task.completed).toEqual(false)
    
        //Assert the owner of the task is correct user
        expect(task.owner).toEqual(userOneId)
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
