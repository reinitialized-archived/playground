local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

local ApiUrl = "http://sny1.reinitialized.net:8080/"

local ServerSettings = {}
local function updateServerSettings()
    if not pcall(
        function()
            ServerSettings = HttpService:JSONDecode(
                HttpService:GetAsync(ApiUrl .."getServerSettings")
            )
            print("updated ServerSettings")
        end
    ) then
        ServerSettings = {}
        print("failed to retrieve ServerSettings")
    end
end

local function isAuthorized(Player)
    local success, response = pcall(
        function()
            return HttpService:JSONDecode(
                HttpService:GetAsync(ApiUrl .."isAuthorized/".. Player.userId)
            )
        end
    )

    if success then
        return response.authorized, response.reason
    end
    return false, "Could not verify identity"
end

Players.PlayerAdded:connect(
    function(joiningPlayer)
        local authorized, declineReason = isAuthorized(joiningPlayer)

        if not authorized then
            joiningPlayer:Kick(declineReason)
        end
        if ServerSettings.Banned[joiningPlayer.userId] then
            print(joiningPlayer, "is banned")
            joiningPlayer:Kick("\nYou are banned from the ScriptBuilder.\nPlease contact Reinitialized in Bleu Pigs")
        end
    end
)

print("ready")
while true do
    updateServerSettings()
    if ServerSettings.Shutdown then
        while wait(0) do
            for _, Player in next, Players:GetPlayers() do
                Player:Kick(ServerSettings.ShutdownReason or "\nServer was shutdown")
            end
        end
    end
    for _, Player in next, Players:GetPlayers() do
        if ServerSettings.Banned[Player.userId] then
            print(Player, "is banned")
            Player:Kick(
                "\nYou are banned from the ScriptBuilder.\nPlease contact Reinitialized in Bleu Pigs"
            )
        end
    end
    wait(10)
end