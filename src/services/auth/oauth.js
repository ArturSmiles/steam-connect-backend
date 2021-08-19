const passport = require("passport")
const SteamStrategy = require("passport-steam").Strategy
const mongoose = require("mongoose")
const User = require("../users/schema")
const fetch = require('node-fetch');
const { authenticate } = require("./")


passport.use("steam",new SteamStrategy({
        returnURL: 'http://localhost:3001/users/steam/return',
        realm: 'http://localhost:3001/',
        apiKey: process.env.STEAM_API_KEY
      },
      async (identifier, profile, done) => {
        const recentlyGames= await fetch(`https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${profile._json.steamid}`)
        const resp = await recentlyGames.json()
        const GamesData = Object.values(resp)
        const Games = GamesData[0].games
        const ownedGames = await fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${profile._json.steamid}`)
        const ownedResp = await ownedGames.json()
        const ownedDataArray = Object.values(ownedResp)
        const ownedData = ownedDataArray[0].games
        const newUser={
            steamid: profile._json.steamid,
            username:profile._json.personaname,
            profileurl:profile._json.profileurl,
            avatar:profile._json.avatarfull,
            recentlyPlayedGames:Games,
            ownedGames:ownedData,
            refreshTokens: []
        }
        try {
            let user = await User.findOne({steamid:profile._json.steamid})

            if(user){
                const tokens = await authenticate(user)
                done(null,{ user, tokens })
            }else{
                const createdUser = new User(newUser)
                await createdUser.save()
                const tokens = await authenticate(createdUser)
                done(null,{ user: createdUser, tokens })
            }
        } catch (err) {
            console.error(err)
        }
      }
    ));

    passport.serializeUser(function(user,done){
        done(null,user)
    })

    passport.deserializeUser(function(id,done){
        User.findById(id,function(err,user){
            done(err,user)
        })
    })