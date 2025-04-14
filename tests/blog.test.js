const { test, after, beforeEach } = require("node:test");
const mongoose = require("mongoose");
const Blog = require("../models/blog");
const User = require("../models/user");
const supertest = require("supertest");
const app = require("../app");
const assert = require("node:assert");
const helper = require("./test_helper");
const bcrypt = require('bcrypt');


const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({})
  
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })
  
  await user.save()
  
  await Blog.deleteMany({});

  const blogObjects = helper.initialBlogs.map((blog) => {
    blog.user = user.id
    return new Blog(blog)
  })

  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);


});

test("una solicitud HTTP GET a la URL /api/blogs", async () => {
  //console.log("\n__________________________\nuna solicitud HTTP GET a la URL /api/blogs\n\n")

  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/); //Se usa una expresion regular para verificar

  const blogList = await helper.blogsInDb();
  //console.log("\n----------\nblogList = ",blogList)
  //console.log("\n__________\n");
  assert.strictEqual(blogList.length, helper.initialBlogs.length);

  
});

test("identificador único de las publicaciones del blog se llame id", async () => {
  //console.log("\n__________________________\nidentificador único de las publicaciones del blog se llame id\n\n")
  const blogList = await helper.blogsInDb();
  //console.log(blogList)
  const firstBlog = blogList[0];
  const properties = Object.keys(firstBlog);
  //console.log(properties)
  assert(properties.includes("id"));
});

test("solicitud HTTP POST a la URL /api/blogs se crea correctamente ", async () => {
  //console.log("\n__________________________\nsolicitud HTTP POST a la URL /api/blogs se crea correctamente\n\n")
  const newBlog = {
    title: "Blog de interes",
    author: "Douglas J Roman",
    url: "LOcalhost",
    likes: 10,
  };

  const userLogin = {
    "username": "root",
    "password": "sekret"
}
  const userToken = await api
  .post("/api/login")
  .send(userLogin)
  .expect(200)
  .expect("Content-Type", /application\/json/);
const tokenAuthorization = "Bearer " + userToken._body.token
//console.log("\nuserToken._body.token= ",userToken._body.token)
//console.log("\ntokenAuthorization= ",tokenAuthorization)

  await api //todos estos metodos corresponden a la aplicacion supertest
    .post("/api/blogs")
    .send(newBlog)
    .set({ Authorization: tokenAuthorization })
    .expect(201)
    .expect("Content-Type", /application\/json/);

  //const response = await api.get('/api/notes')
  //assert.strictEqual(response.body.length, initialNotes.length + 1)
  const blogsAtEnd = await helper.blogsInDb();
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

  //const contents = response.body.map(r => r.content)
  const contents = blogsAtEnd.map((r) => r.title);
  assert(contents.includes("Blog de interes"));
});

test("si la propiedad likes falta en la solicitud, tendrá el valor 0 por defecto ", async () => {
  //console.log("\n__________________________\nsi la propiedad likes falta en la solicitud, tendrá el valor 0 por defecto\n\n")
  await Blog.deleteMany({});
  const newBlog = {
    title: "Falta propiedad likes",
    author: "Douglas J Roman",
    url: "LOcalhost/falta/Likes",
  };

  const userLogin = {
    "username": "root",
    "password": "sekret"
}
  const userToken = await api
  .post("/api/login")
  .send(userLogin)
  .expect(200)
  .expect("Content-Type", /application\/json/);
const tokenAuthorization = "Bearer " + userToken._body.token

  await api //todos estos metodos corresponden a la aplicacion supertest
    .post("/api/blogs")
    .send(newBlog)
    .set({ Authorization: tokenAuthorization })
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  const firstBlog = blogsAtEnd[0];
  const properties = Object.keys(firstBlog);
  //console.log("properties",properties)
  assert(properties.includes("likes"));
  //console.log("firstBlog", firstBlog)
  assert.strictEqual(firstBlog.likes, 0);
});

test("faltan las propiedades title o url, responde 400 Bad Request. ", async () => {
  //console.log("\n__________________________\nfaltan las propiedades title o url, responde 400 Bad Request\n\n")
  const newBlogSinTitle = {
    author: "Douglas J Roman",
    url: "LOcalhost/falta/Title",
  };
  const newBlogSinURL = {
    title: "Falta propiedad URL",
    author: "Douglas J Roman",
  };
  const userLogin = {
    "username": "root",
    "password": "sekret"
}
  const userToken = await api
  .post("/api/login")
  .send(userLogin)
  .expect(200)
  .expect("Content-Type", /application\/json/);
const tokenAuthorization = "Bearer " + userToken._body.token


  await api //todos estos metodos corresponden a la aplicacion supertest
    .post("/api/blogs")
    .send(newBlogSinTitle)
    .set({ Authorization: tokenAuthorization })
    .expect(400);

  let blogsAtEnd = await helper.blogsInDb();
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);

  await api //todos estos metodos corresponden a la aplicacion supertest
    .post("/api/blogs")
    .send(newBlogSinURL)
    .set({ Authorization: tokenAuthorization })
    .expect(400);

  blogsAtEnd = await helper.blogsInDb();
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
});

test("eliminar un solo recurso de publicación de blog", async () => {
  //console.log("\n__________________________\neliminar un solo recurso de publicación de blog\n\n")
  const blogsAtStart = await helper.blogsInDb();
  const blogToDelete = blogsAtStart[0];
  const userLogin = {
    "username": "root",
    "password": "sekret"
}
  const userToken = await api
  .post("/api/login")
  .send(userLogin)
  .expect(200)
  .expect("Content-Type", /application\/json/);
const tokenAuthorization = "Bearer " + userToken._body.token

  await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set({ Authorization: tokenAuthorization })
        .expect(204);

  const blogsAtEnd = await helper.blogsInDb();

  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);

  const contents = blogsAtEnd.map((r) => r.title);
  assert(!contents.includes(blogToDelete.title));
});

test("actualizar la cantidad de likes para una publicación de blog", async () => {
  //console.log("\n__________________________\nactualizar la cantidad de likes para una publicación de blog\n\n")
  const blogsAtStart = await helper.blogsInDb();
  const blogToModify = blogsAtStart[0];
  blogToModify.likes = blogToModify.likes + 1
  //console.log("blogToModify",blogToModify)
 
  await api //todos estos metodos corresponden a la aplicacion supertest
    .put(`/api/blogs/${blogToModify.id}`)
    .send(blogToModify)
    .expect(201);        

  const blogsAtEnd = await helper.blogsInDb();

  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
 
  const blogModified = await api.get(`/api/blogs/${blogToModify.id}`)
//console.log("blogModified",blogModified.body)
  assert.strictEqual(blogModified.body.likes, blogToModify.likes);
});



after(async () => {
  await mongoose.connection.close();
});
