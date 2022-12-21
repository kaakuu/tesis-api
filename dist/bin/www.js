"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const app_1 = require("../app");
const Debug = require("debug");
const mongoose_1 = require("../bin/mongoose");
const debug = Debug("Hyperledger:server");
const port = "8000";
app_1.default.set("port", port);
const server = http.createServer(app_1.default);
const startServer = async () => {
    server.listen(port, () => {
        debug('Express server listening on port' + typeof server.address() === 'AdressInfo' ?
            server.address().port :
            port);
        console.log('listened');
    });
    server.on('error', onError);
    server.on('listening', onListening);
};
const onError = (error) => {
    if (error.syscall != 'listen')
        throw new Error(error);
    const bind = typeof port === 'string' ? 'Port' + port : 'Port' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(bind + 'requires elevated privileges');
            process.exit(1);
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
        default:
            throw error;
    }
};
(0, mongoose_1.connectMongo)();
const onListening = () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe' + addr : 'port' + addr.port;
    debug(`Listening on ${bind}`);
};
startServer();
//# sourceMappingURL=www.js.map