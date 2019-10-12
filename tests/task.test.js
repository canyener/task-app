const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { userOneId, userOne, setupDatabase} = require('./fixtures/db')

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
