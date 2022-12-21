"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkConnection = void 0;
const fabric_network_1 = require("fabric-network");
const path = require("path");
const AppUtil_1 = require("./AppUtil");
class NetworkConnection {
    constructor() {
        this.channelName = 'mychannel';
        this.chaincodeName = 'hashing';
        this.mspOrg1 = 'Org2MSP';
        this.walletPath = path.join(__dirname, 'wallet');
        this.org1UserId = 'administrator';
    }
    //   // in a real application this would be done on an administrative flow, and only once
    //   await enrollAdmin(caClient, wallet, mspOrg1);
    //   // in a real application this would be done only when a new user was required to be added
    //   // and would be part of an administrative flow
    //   await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');
    async startConnection() {
        // Create a new gateway instance for interacting with the fabric network.
        // In a real application this would be done as the backend server session is setup for
        // a user that has been verified.
        const gateway = new fabric_network_1.Gateway();
        // build an in memory object with the network configuration (also known as a connection profile)
        const ccp = (0, AppUtil_1.buildCCPOrg1)();
        // setup the wallet to hold the credentials of the application user
        const wallet = await (0, AppUtil_1.buildWallet)(this.walletPath);
        const gatewayOpts = {
            wallet,
            identity: this.org1UserId,
            discovery: { enabled: true, asLocalhost: true }, // using asLocalhost as this gateway is using a fabric network deployed locally
        };
        // setup the gateway instance
        // The user will now be able to create connections to the fabric network and be able to
        // submit transactions and query. All transactions submitted by this gateway will be
        // signed by this user using the credentials stored in the wallet.
        await gateway.connect(ccp, gatewayOpts);
        // Build a network instance based on the channel where the smart contract is deployed
        const network = await gateway.getNetwork(this.channelName);
        // Get the contract from the network.
        const contract = network.getContract(this.chaincodeName);
        return { contract, gateway };
    }
}
exports.NetworkConnection = NetworkConnection;
//# sourceMappingURL=Network-connection.js.map