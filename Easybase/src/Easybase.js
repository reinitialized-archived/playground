// Easystore: Simplified replicatible json-first Database manager
"use strict"
const Promise = require("bluebird");
const fs = require("fs");

const databaseDirectory = "databases/";
const inMemory = {};

class Easybase {
    constructor(Name) {
        this._databasePath = `${databaseDirectory}${Name}.json`

        try {
            this._data = JSON.parse(fs.readFileSync(this._databasePath));
        } catch {
            this._data = {};
            fs.writeFileSync(this._databasePath, "{}");
        };

        this._lastTouched = Date.now();
        inMemory[Name] = this;
    };

    async GetAsync(Key, UseCache) {
        this._lastTouched = Date.now();

        if (UseCache) {
            return this._data[Key];
        };
        const updatedData = JSON.parse(fs.readFileSync(this._databasePath));
        this._data[Key] = updatedData[Key];
        return this._data[Key];
    };
    async SetAsync(Key, Value) {
        this._lastTouched = Date.now();
        this._data[Key] = Value;
        fs.writeFileSync(this._databasePath, JSON.stringify(this._data));
    };
    async Destroy() {
        fs.writeFileSync(this._databasePath, JSON.stringify(this._data));
        inMemory[Name] = null;
        this.forEach(element => {
            this[element] = null;
        });
    };
};

// Easybase API
async function GetDatabase(Name) {
    if (inMemory[Name]) {
        return inMemory[Name]
    }
    inMemory[Name] = new Easybase(Name)
    return inMemory[Name]
};
exports.GetDatabase = GetDatabase