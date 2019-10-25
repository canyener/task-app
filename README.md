# node-task-app
[![CircleCI](https://circleci.com/gh/canyener/task-app/tree/master.svg?style=svg&circle-token=7c43c72eec616a743ff4aab417d38c6f37e968b1)](https://circleci.com/gh/canyener/task-app/tree/master)

- A simple task manager written with nodejs for learning purposes.
- Includes file uploads, email sending and user profiles.
- Commiting env files on purpose for instructional reasonings.

# deployment steps
- heroku create your-app-name-here
- heroku config:set env_variable_key=env_variable_value
- "heroku config:unset env_variable_key" to remove a variable which is already set
- "git push heroku master" to deploy 

# tests
- Test cases are a bit overkill.
- For learning and practicing, I tried to write as more tests as possible.
