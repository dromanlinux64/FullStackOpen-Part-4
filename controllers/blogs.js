const blogsRouter = require('express').Router()
const Blog = require('../models/blog.js')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})




/* blogsRouter.get('/:id', (request, response, next) => {
  Blog.findById(request.params.id)
  .then(blog =>{
    if (blog) {
       response.json(blog)
    } else {
       response.status(404).end()
    }
  })
  .catch(error =>next(error))
}) */

/* blogsRouter.delete('/:id', (request, response, next) => {
  Blog.findByIdAndDelete(request.params.id)
  .then(() =>{
       response.status(204).end()
  })
  .catch(error =>next(error))  
}) */

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes|| 0,
  })

  /*blog.save()
  .then(savedBlog =>
    response.json(savedBlog)
  )
  .catch(err => next(err)
  )*/
  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)

})

/*blogsRouter.put('/:id', (request, response, next) => {
  const body= request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  Blog.findByIdAndUpdate(
    request.params.id, 
    blog,
    {new:true, runValidators: true, context: 'query'})
  .then(Updatedblog =>{
       response.json(Updatedblog)
  })
  .catch(error =>next(error))
})*/

module.exports = blogsRouter



