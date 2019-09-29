require('../src/db/mongoose')

const User = require('../src/models/user')
const Task = require('../src/models/task')

const main = async () => {
    // const task = await Task.findById('5d91094ffb21ba0c74d5a7b1')
    // await task.populate('owner').execPopulate()
    // console.log(task.owner)

    const user = await User.findById('5d9108354884ff0ec857f862')
    await user.populate('tasks').execPopulate()
    console.log(user.tasks)
}

main()