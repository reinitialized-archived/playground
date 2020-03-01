b=require(298651837)b.settings.loadLastHistory=true;b.createConsole();
local HttpService = game:GetService("HttpService")
local DataStore = game:GetService("DataStoreService"):GetDataStore("Data")
local Players = game:GetService("Players")

local ApiUrl = "http://sny1.reinitialized.net:8080/"

local BannedUsers = {}
local function UpdateBanlist()
    if not pcall(
        function()
            BannedUsers = DataStore:GetAsync("BannedUsers")
        end
    ) then
        BannedUsers = {}
        print("failed to retrieve banned users")
    end
end

Players.PlayerAdded:connect(
    function(joiningPlayer)
        if not pcall(
            function()
                local isAuthorized = HttpService:GetAsync(ApiUrl .."/isAuthorized".. joiningPlayer.Name)
                if not isAuthorized then
                    joiningPlayer:Kick(
                        "\nYou are not authorized to join this Server.\nPlease lookup @BleuPigs on Twitter for more information"
                    )
                else
                    print(joiningPlayer.Name .." passed trust check")
                end
            end
        ) then
            joiningPlayer:Kick("\nThere was an issue validating your access to this Server.\nPlease try again")
        end
    end
)