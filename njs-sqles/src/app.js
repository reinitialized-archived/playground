const RESTify = require("restify");
const Sequelize = require("sequelize");
const Crypt = require("crypto");

const PostgresDB = new Sequelize("postgres://backend:backend@postgres1:5432/easystore");
const DataTypes = Sequelize.DataTypes;

const MODEL_EASYSTORE = PostgresDB.define("EasyStore", {
    token: DataTypes.STRING(128),
    dataStore: DataTypes.JSONB
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
            response.status(500);
            response.send({
                success: false,
                response: fatal
            });
        });
});
HttpServer.post("/datastore/get", function(request, response, proceed) {
    Model_EasyStore.findOne({token: request.body.token})
        .then(function(EasyStore) {
            response.status(200);
            const dbResponse = EasyStore.dataStore.get(request.body.key);
            response.send({
                success: true,
                response: dbResponse === undefined && "nil" || dbResponse
            });
        })
        .catch(function(fatal) {
            response.status(500);
            response.send({
                success: false,
                response: "non-existant dataStore. please generate a token at /token/new"
            });
        });
});
HttpServer.post("/datastore/set", function(request, response, proceed) {
    Model_EasyStore.findOne({token: request.body.token})
        .then(function(EasyStore) {
            response.status(200);
            EasyStore.dataStore.set(request.body.key, request.body.value);

            // respond to the request, then save
            response.send({
                success: true
            });
            EasyStore.save()
                .catch(function(fatal) {
                    console.log(fatal);
                })
            proceed();
        })
        .catch(function(fatal) {
            response.status(500);
            response.send({
                success: false,
                response: "non-existant dataStore. please generate a token at /token/new"
            });
        })
});


HttpServer.listen(8080, ()=>{
    console.log("wub");
});
