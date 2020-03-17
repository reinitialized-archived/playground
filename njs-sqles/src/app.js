const RESTify = require("restify");
const Sequelize = require("sequelize");
const Crypt = require("crypto");

const PostgresDB = new Sequelize("postgres://backend:backend@postgres1:5432/easystore");
const DataTypes = Sequelize.DataTypes;

const MODEL_EASYSTORE = PostgresDB.define("EasyStore", {
    token: {
        type: DataTypes.STRING(128),
        primaryKey: true
    },
    dataStore: {
        type: DataTypes.JSONB,
        allowNull: false
    }
}, {
    freezeTableName: true
});

// HttpServer
const HttpServer = RESTify.createServer();
HttpServer.use(RESTify.plugins.jsonBodyParser());
HttpServer.use(RESTify.plugins.urlEncodedBodyParser());

HttpServer.get("/token/new", function(request, response, proceed) {
    const hash = Crypt.createHash("sha512").update(Crypt.randomBytes(64)).digest("hex");
    MODEL_EASYSTORE.create({
        token: hash,
        dataStore: {}
    })
        .then(function() {
            response.status(200);
            response.send({
                success: true,
                response: hash
            });
        })
        .catch(function(fatal) {
            console.log(fatal);
            response.status(500);
            response.send({
                success: false,
                response: fatal
            });
        });
});
HttpServer.post("/datastore/get", function(request, response, proceed) {
    MODEL_EASYSTORE.findOne({where: {token: request.body.token}})
        .then(function(EasyStore) {
            response.status(200);
            const dbResponse = EasyStore.dataStore[request.body.key];
            console.log(dbResponse);
            response.send({
                success: true,
                response: dbResponse
            });
        })
        .catch(function(fatal) {
            console.log(fatal);
            response.status(500);
            response.send({
                success: false,
                response: "non-existant dataStore. please generate a token at /token/new"
            });
        });
});
HttpServer.post("/datastore/set", function(request, response, proceed) {
    MODEL_EASYSTORE.findOne({where: {token: request.body.token}})
        .then(function(EasyStore) {
            EasyStore.dataStore[request.body.key] = request.body.value
            EasyStore.update({dataStore: EasyStore.dataStore}, {where: {token: request.body.token}})
                .then(function() {
                    response.status(200);
                    response.send({
                        success: true
                    });
                    proceed();
                })
                .catch(function(fatal) {
                    console.log(fatal);
                    response.status(500);
                    response.send({
                        success: false,
                        response: "fatal error occurred"
                    });
                });
        })
        .catch(function(fatal) {
            console.log(fatal);
            response.status(500);
            response.send({
                success: false,
                response: "non-existant dataStore. please generate a token at /token/new"
            });
        })
});

PostgresDB.authenticate()
    .then(async function() {
        console.log("authenticate success. syncing models")
        await PostgresDB.sync();

        HttpServer.listen(8080, ()=>{
            console.log("wub");
        });
    })
    .catch(function(fatal) {
        console.log(fatal);
        throw new Error(fatal);
    });