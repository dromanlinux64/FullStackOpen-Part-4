const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const supertest = require('supertest')
const app = require('../app')
const assert = require("node:assert");
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {

      await Blog.deleteMany({})
    
      const blogObjects = helper.initialBlogs
        .map(blog => new Blog(blog))
      const promiseArray = blogObjects.map(blog => blog.save())
      await Promise.all(promiseArray)
})

test('una solicitud HTTP GET a la URL /api/blogs', async () => {
await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/) //Se usa una expresion regular para verificar

      const blogList = await helper.blogsInDb()  
      console.log(blogList)
      assert.strictEqual(blogList.length, helper.initialBlogs.length)
  })

test('identificador único de las publicaciones del blog se llame id', async () => {
          const blogList = await helper.blogsInDb()  
          //console.log(blogList)
          const firstBlog = blogList[0]
          const properties = Object.keys(firstBlog)
          //console.log(properties)
          assert(properties.includes('id'))    
})

test('solicitud HTTP POST a la URL /api/blogs se crea correctamente ', async () => {
    const newBlog = {
        title: "Blog de interes",
        author: "Douglas J Roman",
        url: "LOcalhost",
        likes: 10,
    }
    await api  //todos estos metodos corresponden a la aplicacion supertest 
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    //const response = await api.get('/api/notes')
    //assert.strictEqual(response.body.length, initialNotes.length + 1) 
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
  
    //const contents = response.body.map(r => r.content)
    const contents = blogsAtEnd.map(r => r.title)
    assert(contents.includes('Blog de interes'))
})
  
test('si la propiedad likes falta en la solicitud, tendrá el valor 0 por defecto ', async () => {
    await Blog.deleteMany({})
    const newBlog = {
        title: "Falta propiedad likes",
        author: "Douglas J Roman",
        url: "LOcalhost/falta/Likes",
    }
    await api  //todos estos metodos corresponden a la aplicacion supertest 
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    const firstBlog = blogsAtEnd[0]
    const properties = Object.keys(firstBlog)
    //console.log("properties",properties)
    assert(properties.includes('likes')) 
    //console.log("firstBlog", firstBlog) 
    assert.strictEqual(firstBlog.likes, 0)
  
})

test.only('faltan las propiedades title o url, responde 400 Bad Request. ', async () => {
    const newBlogSinTitle = {
        author: "Douglas J Roman",
        url: "LOcalhost/falta/Title",
    }
    const newBlogSinURL = {
        title: "Falta propiedad URL",
        author: "Douglas J Roman",
  
    }

    await api  //todos estos metodos corresponden a la aplicacion supertest 
      .post('/api/blogs')
      .send(newBlogSinTitle)
      .expect(400)

    let blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)    

    await api  //todos estos metodos corresponden a la aplicacion supertest 
      .post('/api/blogs')
      .send(newBlogSinURL)
      .expect(400)

    blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)    

})
after(async () => {
    await mongoose.connection.close()
  })