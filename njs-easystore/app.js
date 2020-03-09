// EasyStore: JSON first Postgres backed database
'use strict';
const GetEasyStore = require("./EasyStore");
const Express = require("express");
const Crypto = require("crypto");
const prepareRequest = require("bent");

const ReplicatingNodes = GetEasyStore("ReplicatingNodes")
const EasyStoreIds = GetEasyStore("EasyStoreIds")

const INSTANCE_ID = process.env.instanceId

// Define Route APIs
async function CreateNewDatabaseHash(request, response) {
    let hash = Crypto.createHash('sha256').update(Crypto.randomBytes(64)).digest('hex');
    while (EasyStoreIds.Get(hash)) {
        hash = Crypto.createHash('sha256').update(Crypto.randomBytes(64)).digest('hex');
    }

    EasyStoreIds.SetAsync(hash, true)
    return response.status(200).send({success: true, response: hash});
};

async function GetFromDatabase(request, response) {
    const WorkingDatabase = GetDatabase(request.body.name);
    response.status(200).send({
        success: true,
        response: WorkingDatabase.Get(request.body.key)
    });
};

async function SetToDatabase(request, response) {
    const WorkingDatabase = GetDatabase(request.body.name);
    await WorkingDatabase.SetAsync(request.body.key, request.body.value);
    response.status(200).send({success: true});
};

// Define Replication APIs
async function AssignAsSlave(request, response) {
    if (ReplicatingNodes.Get(request.body.instanceId)) {
        return response.status(500).send({
            success: false,
            response: "instance already assigned as slave"
        });
    };

    await ReplicatingNodes.SetAsync(request.body.instanceId, {})
    response.status(200).send({
        success: true,
        response: "assigned as slave"
    });
}

//const post = bent('http://localhost:3000/', 'POST', 'json', 200);
//const response = await post('cars/new', {name: 'bmw', wheels: 4});

async function ReplicateToNodes(changingData) {
    ReplicatingNodes.GetAllEntries().forEach(async instanceId => {
        const response = await prepareRequest(`http://${instanceId}-es.in.reinitialized.net/easystore/replicate/`)
    });
}


// Hook routes
const DatabaseRoutes = Express.Router();
DatabaseRoutes.use(Express.json());
DatabaseRoutes.use(Express.urlencoded({extended: true}));

DatabaseRoutes.get("/new", CreateNewDatabaseHash);
DatabaseRoutes.get("/", GetFromDatabase);
DatabaseRoutes.post("/", SetToDatabase);

const HttpServer = Express();
HttpServer.use("/easystore/", DatabaseRoutes);
HttpServer.listen(3000)