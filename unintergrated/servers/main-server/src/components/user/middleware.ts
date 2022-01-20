
function requiresUser(){
  return (req, res, next)=>{
    if(req.user) return next()
    next({
      status: 403,
      message: "User Forbidden"
    })
  }
}

export {
  requiresUser
}
