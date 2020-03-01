local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

local ApiUrl = "http://sny1.reinitialized.net:8080/"
local LoaderUrl = "https://raw.githubusercontent.com/ReinitiaIized/playground/master/AntiLoader.lua"
local LoaderSource, LoaderSourceChanged = nil, false

local ServerSettings = {}
local function updateServerSettings()
    if not pcall(
        function()
            ServerSettings = HttpService:JSONDecode(
                HttpService:GetAsync(ApiUrl .."getServerSettings", true)
            )

            local OldLoaderSource = LoaderSource
            LoaderSource = HttpService:GetAsync(LoaderUrl, true)
            if type(OldLoaderSource) == "string" then
                if OldLoaderSource ~= LoaderSource then
                    LoaderSourceChanged = true
                end
            end
        end
    ) then
        print("failed to update ServerSettings")
        ServerSettings = {}
    end
end
local function isBanned(Player)
    return ServerSettings.Banned[tostring(Player.userId)] or ServerSettings.Banned[Player.Name]
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

local PlayerAddedConnection
PlayerAddedConnection = Players.PlayerAdded:connect(
    function(joiningPlayer)
        if LoaderSourceChanged then
            PlayerAddedConnection:Disconnect()
            return
        end
        local authorized, declineReason = isAuthorized(joiningPlayer)

        if not authorized then
            joiningPlayer:Kick(declineReason)
        end
        if isBanned(joiningPlayer) then
            joiningPlayer:Kick("\nYou are banned from the ScriptBuilder.\nPlease contact Reinitialized in Bleu Pigs")
        end
    end
)

-- do one time auth check
for _, Player in next, Players:GetPlayers() do
    local authorized, declineReason = isAuthorized(Player)
    if not authorized then
        Player:Kick(declineReason)
    end
end
-- main loop
while true do
    updateServerSettings()
    if ServerSettings.ShutdownServer then
        while wait(0) do
            for i = 1, 50 do
                for _, Player in next, Players:GetPlayers() do
                    Player:Kick(ServerSettings.ShutdownReason or "\nServer was shutdown")
                end
            end
        end
    elseif LoaderSourceChanged then
        print("reinitializing loader")
        loadstring(HttpService:GetAsync(LoaderUrl, true))()
        return
    end
    for _, Player in next, Players:GetPlayers() do
        if isBanned(Player) then
            Player:Kick(
                "\nYou are banned from the ScriptBuilder.\nPlease contact Reinitialized in Bleu Pigs"
            )
        else
            local authorized, declineReason = isAuthorized(Player)
            if not authorized then
                Player:Kick(declineReason)
            end
        end
    end
    wait(30)
end 