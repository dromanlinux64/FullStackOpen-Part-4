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
  module.exports = {
    dummy,
    totalLikes, 
    favoriteBlog
  }