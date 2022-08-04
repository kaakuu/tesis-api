import { Gateway } from 'fabric-network';
export declare class NetworkConnection {
    readonly channelName = "mychannel";
    readonly chaincodeName = "hashing";
    readonly mspOrg1 = "Org2MSP";
    readonly walletPath: string;
    readonly org1UserId = "administrator";
    constructor();
    startConnection(): Promise<{
        contract: import("fabric-network").Contract;
        gateway: Gateway;
    }>;
}
