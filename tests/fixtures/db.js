const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const validObjectId = mongoose.Types.ObjectId()

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'User One',
    email: 'userOne@example.com',
    password: 'userOne1!',
    tokens: [{
        token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'User Two',
    email: 'userTwo@example.com',
    password: 'userTwo1!',
    tokens: [{
        token: jwt.sign({_id: userTwoId}, process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test Task One Description',
    completed: false,
    owner: userOneId
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test Task Two Description',
    completed: true,
    owner: userOneId
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test Task Three Description',
    completed: true,
    owner: userTwoId
}

const setupDatabase = async () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    validObjectId,
    userOneId,
    userOne,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
}