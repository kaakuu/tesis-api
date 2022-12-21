"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnect = exports.connectMongo = void 0;
const Mongoose = require("mongoose");
let database;
const connectMongo = () => {
    // add your own uri below
    const uri = 'mongodb://127.0.0.1:27017/trabajo_final_db';
    if (database) {
        return;
    }
    Mongoose.connect(uri, {
        useNewUrlParser: true,
        useFindAndModify: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    });
    database = Mongoose.connection;
    database.once("open", async () => {
        console.log("Connected to database");
    });
    database.on("error", () => {
        console.log("Error connecting to database");
    });
};
exports.connectMongo = connectMongo;
const disconnect = () => {
    if (!database) {
        return;
    }
    Mongoose.disconnect();
};
exports.disconnect = disconnect;
//# sourceMappingURL=mongoose.js.map