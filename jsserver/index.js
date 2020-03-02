'use strict';
const Express = require("express")
const Discord = require("discord.js")
const FS = require("fs")
const AuthenticationSettings = require("./authenticationSettings.json")
const AppSettings = require("./appSettings.json")

const DiscordBot = new Discord.Client()
const ROBLOXBot = require("noblox.js")
let ManagedGuild

// APIs
async function isAuthorizedToJoinSRE(userId) {
    const username = await ROBLOXBot.getUsernameFromId(userId)
    if (username) {
        const User = ManagedGuild.members.find(member => member.nickname === username || member.user.username === username)
        if (User === null) {
            return {authorized: false, declineReason: "User not found in Discord\nVisit @BleuPigs on Twitter to learn how to join"}
        } else {
            const HasRole = User.roles.get(AppSettings.discord.membershipRole)
            if (HasRole === null) {
                return {authorized: false, declineReason: "User not authorized\nYour membership has not been approved in Bleu Pigs"}
            } else {
                return {authorized: true}
            }
        }
    }
    return {authorized: false, declineReason: "User not found in ROBLOX"}
}

async function isAuthorizedToJoinDiscord(guildMember) {
    if (guildMember.roles.find(role => role.id == AppSettings.discord.verifiedRole)) {
        const userId = await ROBLOXBot.getIdFromUsername(guildMember.nickname || guildMember.user.username)
        if (userId) {
            const rankName = ROBLOXBot.getRankNameInGroup(AppSettings.roblox.oldGroup, userId)
            if (rankName) {
                return true
            }
        }
    }
    return false
}

async function sendNotificationToMember(guildMember, notification) {
    if (guildMember.user !== DiscordBot.user) {
        const dmChannel = await guildMember.createDM(DiscordBot.user)
        if (dmChannel) {
            dmChannel.send(notification)
                .catch(() => {
                    ManagedGuild.channels.get(AppSettings.discord.botNotificationsChannel).send(`<@${guildMember.id}>` + notification)
                        .catch((fatal) => console.log(fatal))
                })
            return
        }
        ManagedGuild.channels.get(AppSettings.discord.botNotificationsChannel).send(`<@${guildMember.id}>` + notification)
            .catch((fatal) => console.log(fatal))
    }
}

async function processNewMember(newGuildMember) {
    if (!newGuildMember.user === DiscordBot.user && !newGuildMember.roles.get(AppSettings.discord.verifiedRole && !newGuildMember.roles.get(AppSettings.discord.membershipRole))) {
        if (await isAuthorizedToJoinDiscord(newGuildMember)) {
            newGuildMember.addRole(AppSettings.discord.membershipRole)
                .then(() => {
                    sendNotificationToMember(newGuildMember, `**Welcome back to Bleu Pigs, ${newGuildMember.nickname || newGuildMember.user.username}!**\n\nBecause you were in the original Bleu Pigs ROBLOX group, I went ahead and granted you access back to the Server.\n\n*NOTE:* We are currently in the process of redefining Bleu Pigs, meaning there will changes occurring.`)
                })
                .catch((fatal) => {
                    sendNotificationToMember(newGuildMember, "I ran into an issue assigning you the Bleu Pig role. I'll try again in 30 minutes")
                    sendNotificationToMember(
                        ManagedGuild.users.get(AppSettings.discord.serverAdministrator),
                        `I ran into an issue. Here's what happened:\n${fatal}`
                    )
                })
        } else {
            if (!newGuildMember.roles.get(AppSettings.discord.alreadyCheckedRole)) {
                sendNotificationToMember(newGuildMember, `**Welcome to the new Bleu Pigs, <@${member.id}>**\nCurrently, we do not have a Joining Process in place as we work on redefining ourselves. If you would like to know when we begin accepting new members, stay in the Discord or follow us on Twitter @BleuPigs https://twitter.com/BleuPigs`)
                newGuildMember.addRole(AppSettings.discord.alreadyCheckedRole)
                    .catch(fatal => {
                        sendNotificationToMember(member, "There was an issue setting the alreadyChecked role to your user. You may continue to receive this notification every 30 minutes until this is fixed.")
                        sendNotificationToMember(
                            ManagedGuild.users.get(AppSettings.discord.serverAdministrator),
                            `I ran into an issue. Here's what happened:\n${fatal}`
                        )
                    })
            }
        }
    } else {
        sendNotificationToMember(newGuildMember, `${newGuildMember.nickname || newGuildMember.user.username}, I've noticed you haven't verified yet!\nIf you are a former member of Bleu Pigs and are still within the old ROBLOX Group, you can automatically get in by verifying at https://verify.eryn.io!\nThis message will be repeated every 30 minutes until you verify.`)
    }
}

// HTTP APIs
let ServerRoutes = Express.Router()
ServerRoutes.get(
    "/getServerSettings",
    (request, response) => {
        FS.readFile("./serverSettings.json", (readFailed, rawData) => {
            if (!readFailed) {
                response.status(200).send(
                    JSON.stringify(
                        JSON.parse(rawData)
                    )
                )
            } else {
                response.status(500).send("failed to read data")
                sendNotificationToMember(
                    ManagedGuild.users.get(AppSettings.discord.serverAdministrator),
                    `I ran into an issue. Here's what happened:\n${fatal}`
                )
            }
        }
    )}
)
ServerRoutes.get(
    "/isAuthorized/:userId",
    (request, response) => {
        // Get Discord Member by their Nickname, make sure they have the Bleu Pig role, and return
        // a response
        isAuthorizedToJoinSRE(request.params.userId)
            .then(authorizedResponse => response.status(200).send(JSON.stringify(authorizedResponse)))
            .catch(fatal => {
                response.status(500).send(
                    JSON.stringify(
                        {
                            authorized: false, 
                            declineReason: "server error"
                        }
                    )
                )
                console.log(fatal)
            })
    }
)
// Discord 
DiscordBot.on(
    "ready", () => {
        ManagedGuild = DiscordBot.guilds.get(AppSettings.discord.managedGuild)
        if (!ManagedGuild) {
            console.error("failed to find Guild")
        } else {
            HttpApiServer.listen(8080)
            // search for pending members real quick
            ManagedGuild.members.forEach(processNewMember)
            setInterval(() => ManagedGuild.members.forEach(processNewMember), 1800000)
            console.log("ready")
        }
    }
)
DiscordBot.on("guildMemberAdd", processNewMember)
// Initialization
let HttpApiServer = Express()
HttpApiServer.use(ServerRoutes)
DiscordBot.login(AuthenticationSettings.discord)