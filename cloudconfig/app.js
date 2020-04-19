const express = require("express");
const fs = require("fs");

const routes = express.Router();
routes.get("/cc", function (request, response) {
    fs.readFile("./cloudconfig.yaml", function (failed, data) {
        if (!failed) {
            response.status(200).send(data);
        } else {
            response.status(500).send("failure");
            console.log(failed);
        }
    });
});

const server = express();
server.use(routes);
server.listen(8080);