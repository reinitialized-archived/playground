const FS = require("fs")
const Express = require("express")

const Router = Express.Router()
Router.get("/cis", (request, response) => {
    FS.readFile("./cloudinit-server.yaml", (readFailed, rawData) => {
        if (!readFailed) {
            response.status(200).send(rawData)
        } else {
            response.status(500).send("failed to read data")
            console.log(readFailed)
        }
    })
})
Router.get("/cic", (request, response) => {
    FS.readFile("./cloudinit-client.yaml", (readFailed, rawData) => {
        if (!readFailed) {
            response.status(200).send(rawData)
        } else {
            response.status(500).send("failed to read data")
            console.log(readFailed)
        }
    })
})

const Server = Express();
Server.use(Router)
Server.listen(80)