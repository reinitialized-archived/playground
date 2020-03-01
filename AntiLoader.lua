local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

local ApiUrl = "http://sny1.reinitialized.net:8080/"

local BannedUsers = {}
local function updateBanlist()
    if not pcall(
        function()
            BannedUsers = HttpService:JSONDecode(
                HttpService:GetAsync(ApiUrl .."getBanned")
            )
        end
    ) then
        BannedUsers = {}
        print("failed to retrieve banned users")
    end
end

local function isAuthorized(Player)
    local success, authorized, Reason = pcall(
        function()
            local Response = HttpService:JSONDecode(
                HttpService:GetAsync(ApiUrl .."isAuthorized/".. Player.userId)
            )
            if Response.Authorized then
                return true
            end
            return false, Response.Reason
        end
    )

    if success then
        return authorized, Reason
    end
    return false, "Could not verify identity"
end

Players.PlayerAdded:connect(
    function(joiningPlayer)
        local authorized, declineReason = isAuthorized(joiningPlayer)

        if not authorized then
            joiningPlayer:Kick(declineReason)
        end
        if BannedUsers[joiningPlayer.userId] then
            joiningPlayer:Kick("\nYou are banned from the ScriptBuilder.\nPlease contact Reinitialized in Bleu Pigs")
        end
    end
)

while true do
    updateBanlist()
    for _, Player in next, Players:GetPlayers() do
        if BannedUsers[Player.userId] then
            Player:Kick(
                "\nYou are banned from the ScriptBuilder.\nPlease contact Reinitialized in Bleu Pigs"
            )
        end
    end
    wait(10)
end