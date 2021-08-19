const express = require("express")
const passport = require("passport")

const UserModel = require("./schema")
const { authenticate, refresh } = require("../auth")
const { authorize } = require("../auth/middlewares")

const userRouter = express.Router()


//@desc     Get all Users
//@route    GET /users/

userRouter.get("/", async (req, res, next) => {
    try {
      const Users = await UserModel.find()
      res.send(Users)
    } catch (error) {
      next(error)
    }
  })
  
  //@desc     Get one user with Steamid
  //@route    GET /users/{steamid}
  
  userRouter.get("/:steamid", async (req, res, next) => {
    try {
      const Users = await UserModel.findOne({ steamid:req.params.steamid });
      res.send(Users)
    } catch (error) {
      next(error)
    }
  })

  userRouter.put("/:steamid", async (req, res, next) => {
    try {
      const Users =  await  UserModel.findOneAndUpdate({steamid:req.params.steamid},req.body,{new:true});
      res.send(Users)
    } catch (error) {
      next(error)
    }
  })
  
  //@desc     Get User Details of authorized User
//@route    GET users/me

userRouter.get("/profile/me",authorize, async (req, res, next) => {
  try {
        res.send(req.user)
      } catch (error) {
        next(error)
      }
    })
    
    //@desc     Edit User Details of authorized User
    //@route    PUT users/me
    
  userRouter.put("/profile/me",authorize, async (req, res, next) => {
      try {
        const Users =  await  UserModel.findOneAndUpdate({steamid:req.user.steamid},req.body,{new:true});
        res.send(Users)
      } catch (error) {
        next(error)
      }
    })
    
    //@desc     Delete authorized User Details
    //@route    DELETE users/me
    
    userRouter.delete("/profile/me",authorize, async (req, res, next) => {
      try {
        const Users =  await  UserModel.findOneAndDelete({steamid:req.user.steamid});
        res.send(Users)
      } catch (error) {
        next(error)
      }
    })
    

//@desc     Auth with Steam
//@route    GET users/steam
userRouter.get('/auth/steam',
passport.authenticate('steam'),
  function(req, res) {
    // The request will be redirected to Steam for authentication, so
    // this function will not be called.
});

//@desc     Redirect after Auth
//@route    GET users/steam/return
  userRouter.get(
    "/steam/return",
    passport.authenticate('steam'),
    async (req, res, next) => {
      try {
        res.cookie("accessToken", req.user.tokens.accessToken, {
          httpOnly: true,
        })
        res.cookie("refreshToken", req.user.tokens.refreshToken, {
          httpOnly: true,
          path: "/users/refreshToken",
        })
  
        res.status(200).redirect("http://localhost:3000/")
      } catch (error) {
        next(error)
      }
    }
  )

  module.exports = userRouter