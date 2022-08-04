import { Gateway, GatewayOptions } from 'fabric-network';
import * as path from 'path';
import { buildCCPOrg1, buildCCPOrg2, buildWallet } from './AppUtil';


export class NetworkConnection {
    readonly channelName = 'mychannel';
    readonly chaincodeName = 'hashing';
    readonly mspOrg1 = 'Org2MSP';
    readonly walletPath = path.join(__dirname, 'wallet');
    readonly org1UserId = 'administrator';

    constructor(){}    

    //   // in a real application this would be done on an administrative flow, and only once
    //   await enrollAdmin(caClient, wallet, mspOrg1);

    //   // in a real application this would be done only when a new user was required to be added
    //   // and would be part of an administrative flow
    //   await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

    async startConnection() { //ver de tipar esto.
        // Create a new gateway instance for interacting with the fabric network.
        // In a real application this would be done as the backend server session is setup for
        // a user that has been verified.
        const gateway = new Gateway();
        // build an in memory object with the network configuration (also known as a connection profile)
        const ccp = buildCCPOrg1();
        // setup the wallet to hold the credentials of the application user
        const wallet = await buildWallet(this.walletPath);

        const gatewayOpts: GatewayOptions = {
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