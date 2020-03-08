"use strict";
// Librariesclear
const Easybase = require("./Easybase");
const Promise = require("bluebird");
const Express = require("express");
// Constants
const HttpApiRouter = Express.Router();

// HttpApiRouter
HttpApiRouter.use(Express.json());
HttpApiRouter.use(Express.urlencoded({extended: true}));

HttpApiRouter.get(
    "/get/:name",
    async (request, response) => {
        const Database = await Easybase.GetDatabase(request.params.name);
        response.status(200).send({
            success: true,
            response: Database._data
        })
    }
)

const HttpServer = Express()
HttpServer.use("/api", HttpApiRouter)
HttpServer.listen(8080)
