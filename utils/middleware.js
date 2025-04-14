const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user.js')

const requestLogger = (request, response, next) =>{
  logger.info('\nMethod: ', request.method)
  logger.info('Path: ', request.path)
  logger.info('Body: ', request.body)
  logger.info('========================\n')
  next()
}

const tokenExtractor = (request, response, next)  => {
  const authorization = request.get('authorization')
   //console.log("\nrequest.get(authorization)= ",authorization)
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token= authorization.replace('Bearer ', '')
  }
   //console.log("\nrequest.token= ",request.token)

  next()
}

const userExtractor = async (request, response, next)  => {
  const token = request.token
if(token){
  const decodedToken = jwt.verify(token, process.env.SECRET)
  //console.log("\ndecodedToken=",decodedToken)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }
  const user = await User.findById(decodedToken.id)
  request.user = user
}
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}


const errorHandler = (error, request, response, next) => {
  logger.error("error.message= ",error.message)
  logger.error("error.name= ",error.name)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  }else if (error.name ===  'JsonWebTokenError') {
    return response.status(401).json({ error: 'token invalid' })
  }else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  }
  next(error)
}


module.exports = {
  unknownEndpoint ,
  errorHandler,
  requestLogger,
  tokenExtractor,
  userExtractor
}