const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    steamid:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    profileurl:{
        type:String,
        required:true
    },
    avatar:{
        type:String,
        required:true
    },
    name:{
        type:String,
        default:""
    },
    lastName:{
        type:String,
        default:""
    },
    recentlyPlayedGames:{
        type:Array
    },
    ownedGames:{
        type:Array
    },
    favoriteGames:{
        type:Array
    },
    refreshTokens: [{ token: { type: String } }],
    
},
{ timestamps: true }
)

module.exports = mongoose.model("User",UserSchema)