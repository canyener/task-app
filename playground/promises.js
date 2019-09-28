require('../src/db/mongoose')
const User = require('../src/models/user')
const Task = require('../src/models/task')


const deleteTaskAndCount = async (id) => {
    await Task.findByIdAndDelete(id);
    const count = await Task.countDocuments({completed: false})
    return count
}

deleteTaskAndCount('5d55c31743393f1f0067530f').then(count => {
    console.log(count)
}).catch(e => {
    console.log(e)
})

// const updateAgeandCount = async (id, age) => {
//     const user = await User.findByIdAndUpdate(id, { age })
//     const count = await User.countDocuments({age})

//     return count
// }

// updateAgeandCount('5d55c2a62fb3f33098bcaf06', 2).then(count => {
//     console.log(count)
// }).catch(e => {
//     console.log(e)
// })

// User.findByIdAndUpdate('5d55c2a62fb3f33098bcaf06', {age: 1}).then(user => {
//     console.log(user)
//     return User.countDocuments({age: 1})
// }).then(result => {
//     console.log(result)
// }).catch(e => {
//     console.log(e)
// })

// Task.findByIdAndDelete('5d55b4008678a109e8d99cf8').then(task => {
//     console.log(task)
//     return Task.countDocuments({completed: false})
// }).then(result => {
//     console.log(result)
// }).catch(e => {
//     console.log(e)
// })

// const add = (a, b) => {
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             resolve(a + b)
//         }, 2000);
//     })
// }

// add(1, 1).then(sum => {
//    console.log(sum)
//    return add(sum, 4) 
// }).then(sum => {
//     console.log(sum)
// }).catch(e => {
//     console.log(e)
// })