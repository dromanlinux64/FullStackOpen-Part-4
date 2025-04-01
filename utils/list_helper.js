const {maxBy, keyBy, countBy,map, groupBy }= require('lodash');

const dummy = (blogs) => {
    // ...
    return 1
  }
  
  const totalLikes = (blogs)=>{
    const result = blogs.reduce((acc,blog)=> acc+ blog.likes,0)
    return result
  }

  const favoriteBlog = (blogs)=>{
    if (blogs.length === 0) return {}
    const numLikes = blogs.map((blog)=>blog.likes)

    const favoriteVal = Math.max(...numLikes)

    const result = blogs.find((blog) => blog.likes===favoriteVal)

    return {
        title: result.title ,
        author: result.author,
        likes: result.likes
        }
  }

  const mostBlogs = (blogs)=>{
    if (blogs.length === 0) return {}
    const result1 = countBy(blogs,"author")
    //console.log("result1",result1)
    const result2 = map(result1,(valor,author)=>{
       return  {"author":author, "blogs":valor}
    })
    //console.log("result2",result2)
    const result3 = maxBy(result2,"blogs")
    //console.log("result3",result3)
    return  result3
  }

  const mostLikes  = (blogs)=>{
    if (blogs.length === 0) return {}
    const result1 = groupBy(blogs,"author")
    //console.log("result1",result1)
    const result2 = map(result1,(blogsAuthor,author)=>{
        //const sumLikes =  result1[author].reduce((likes,blog)=>{
        const sumLikes =  blogsAuthor.reduce((likes,blog)=>{
                return likes+blog.likes
       },0)
       return  {"author":author, "likes":sumLikes}
    })
    //console.log("result2",result2)
    const result3 = maxBy(result2,"likes")
    //console.log("result3",result3)
    return  result3
  }
  module.exports = {
    dummy,
    totalLikes, 
    favoriteBlog,
    mostBlogs,
    mostLikes 
  }