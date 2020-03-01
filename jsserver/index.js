'use strict';

const Express = require("express")
const Discord = require("discord.js")
const ROBLOX = require("noblox.js")
const BannedList = require("./banned.json")

const ServerBot = new Discord.Client()
const ManagedGuildId = "151403861905506304"
const RoleId = "214981841017372672"
let ManagedGuild

let ServerRoutes = Express.Router()
// ServerRoutes.get(
//     "/getBanlist",
//     (request, response) => {
//         response.status(400).send(BannedList)
//     }
// )
ServerRoutes.get(
    "/isAuthorized/:username",
    (request, response) => {
        // Get Discord Member by their Nickname, make sure they have the Bleu Pig role, and return
        // a response
        const User = ManagedGuild.members.find(member => member.nickname === request.params.username)
        if (User === null) {
            response.status(200).send(
                JSON.stringify(
                    {
                        authorized: false
                    }
                )
            )
        } else {
            const HasRole = User.roles.find((role) => role.id === RoleId)
            if (HasRole === null) {
                response.status(200).send(
                    JSON.stringify(
                        {
                            authorized: false
                        }
                    )
                )
            } else {
                response.status(200).send(
                    JSON.stringify(
                        {
                            authorized: true
                        }
                    )
                )
            }
        }
    }
)

ServerBot.on(
    "ready",
    () => {
        ManagedGuild = ServerBot.guilds.get(ManagedGuildId)
        if (ManagedGuild === null) {
            console.error("failed to find Guild")
        } else {
            ServerApp.listen(8080)
            console.log("server ready")
        }
    }
)


let ServerApp = Express()
ServerApp.use(ServerRoutes)
ServerBot.login("NjgyNzc3OTY5NjIxNTk4MjQw.XltDWg.YUEKL_lJlJRPymuFjcsY3tIAXNM")
