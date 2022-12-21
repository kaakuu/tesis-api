import * as http from 'http';
import app from '../app';
import * as Debug from 'debug';
import { AddressInfo } from 'net';
import { connectMongo } from '../bin/mongoose';

const debug = Debug("Hyperledger:server");

const port = "8000";

app.set("port", port);

const server = http.createServer(app);

const startServer = async () => {
        server.listen(port, () => {
            debug(
                'Express server listening on port' + typeof server.address() === 'AdressInfo' ?
                (server.address() as AddressInfo ).port : 
                port
            );
            console.log('listened')
        });
        server.on('error', onError) ;
        server.on('listening', onListening);
}

const onError = ( error: any ) => {
    if( error.syscall != 'listen' )
    throw new Error(error);

    const bind = typeof port === 'string' ? 'Port' + port: 'Port' + port;

    switch (error.code) {
        case 'EACCES':
            console.error(bind+ 'requires elevated privileges');
            process.exit(1);
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
    
        default:
            throw error;
    }
}

connectMongo()


const onListening = ()=> {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe' + addr : 'port' + addr.port;
    debug(`Listening on ${bind}`);
}

startServer();