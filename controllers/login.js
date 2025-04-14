const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })
  //console.log("\nloginRouter user= ",user)
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }
  //console.log("\nloginRouter userForToken= ",userForToken)
  //const token = jwt.sign(userForToken, process.env.SECRET)
// el token expira in 60*60 segundos, eso es, en una hora
const token = jwt.sign(
    userForToken, 
    process.env.SECRET,
    { expiresIn: 60*60 }
  )
  //console.log("\nloginRouter token= ",token)
  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter 