local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

local ApiUrl = "http://sny1.reinitialized.net:8080/"

local BannedUsers = {}
local function updateBanlist()
    if not pcall(
        function()
            BannedUsers = HttpService:JSONDecode(
                HttpService:GetAsync(ApiUrl .."getBanned/")
            )
        end
    ) then
        BannedUsers = {}
        print("failed to retrieve banned users")
    end
end

Players.PlayerAdded:connect(
    function(joiningPlayer)
        UpdateBanlist()
        if not pcall(
            function()
                local Response = HttpService:JSONDecode(
                    HttpService:GetAsync(ApiUrl .."isAuthorized/".. joiningPlayer.Name)
                )
                if not Response.authorized then
                    joiningPlayer:Kick(
                        Response.reason
                    )
                    return
                else
                    if BannedUsers[joiningPlayer.userId] then
                        joiningPlayer:Kick(
                            "\nYou are banned from the ScriptBuilder.\nPlease contact Reinitialized in Bleu Pigs"
                        )
                        return
                    end
                    print(joiningPlayer.Name .." passed trust check")
                end
            end
        ) then
            joiningPlayer:Kick("\nThere was an issue validating your access to this Server.\nPlease try again")
        end
    end
)

while true do
    updateBanlist()
    wait(30)
end