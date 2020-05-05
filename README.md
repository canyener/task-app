# Task App
[![CircleCI](https://circleci.com/gh/canyener/task-app/tree/master.svg?style=svg&circle-token=7c43c72eec616a743ff4aab417d38c6f37e968b1)](https://circleci.com/gh/canyener/task-app/tree/master)
<!-- [![Build Status](https://travis-ci.com/canyener/task-app.svg?token=WqoGmsJD2eWcyCxqP2Hy&branch=master)](https://travis-ci.com/canyener/task-app) -->

- A simple task manager written in Node.Js for learning purposes.
- Includes file uploads, email sending, CI, Slack integrations and user profiles.
- Commiting env files on purpose for instructional reasons.

## deployment steps
```heroku create <your-app-name-here>```

```heroku config:set <env_variable_key>=<env_variable_value>```

```heroku config:unset <env_variable_key>``` to remove a variable which is already set

```git push heroku master``` to deploy 

## tests
- Test cases are a bit overkill.
- For learning and practicing, I tried to write as many tests as possible.

## env files

You can always check `.env.example` file to see which env variables you need.
- Create env files in root directory or modify your scripts to run them properly.
- Create `.env.test` file to setup env variables for tests.
- Create `.env.development` file to setup env variables for development server and database.