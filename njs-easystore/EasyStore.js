'use strict';
const fs = require("fs");

const InMemory = {};
const DatabasePath = "./Databases/";

class EasyStore {
    constructor(Name) {
        const filePath = `${DatabasePath}${Name}.json`;
        if (fs.existsSync(filePath)) {
            this._dataStore = JSON.parse(fs.readFileSync(filePath));
        } else {
            this._dataStore = {};
            fs.writeFileSync(filePath, JSON.stringify(this._dataStore));
        };

        this._filePath = filePath;
        InMemory[Name] = this;
    };

    async SetAsync(Key, Value) {
        this._dataStore[Key] = Value;
        fs.writeFileSync(this._filePath, JSON.stringify(this._dataStore));
    };
    Get (Key) {
        return this._dataStore[Key];
    };
    GetAllEntries() {
        let Entries = []
        this._dataStore.forEach(entry => {
            Entries.push(entry)
        });
        return Entries
    };
};

module.exports = function(Name) {
    let Database = InMemory[Name];
    if (!Database) {
        Database = new EasyBase(Name);
    };

    return Database;
};
