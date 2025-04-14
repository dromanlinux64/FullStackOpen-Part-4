const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require("node:assert");
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)

//...

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      password: 'salainen',
      name: 'Matti Luukkainen',
      }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      "username": "root",
      "name": "Superuser",
      "password": "salainen",
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    console.log("\nresult.body.error= ",result.body.error,"\n")    
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
  
  test('creation fails with proper statuscode and message if username is len<3 chars', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      "username": "ro",
      "name": "Superuser",
      "password": "salainen",
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    console.log("\nresult.body.error= ",result.body.error,"\n")
    assert(result.body.error.includes('is shorter than the minimum allowed length (3)'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if password is len<3 chars', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      "username": "root2",
      "name": "Superuser",
      "password": "sa",
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    console.log("\nresult.body.error= ",result.body.error,"\n")
    assert(result.body.error.includes('Password must have min 3 chars'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if no username is provided', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      "username": "",
      "name": "Superuser",
      "password": "password",
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    console.log("\nresult.body.error= ",result.body.error,"\n")
    assert(result.body.error.includes('Path `username` is required'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
  test('creation fails with proper statuscode and message if no password is provided', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      "username": "usuario",
      "name": "Superuser",
      "password": "",
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    console.log("\nresult.body.error= ",result.body.error,"\n")
    assert(result.text.includes('Password must be provided'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})


after(async () => {
  await mongoose.connection.close()
})