"use strict";
/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettyJSONString = exports.buildWallet = exports.buildCCPOrg2 = exports.buildCCPOrg1 = void 0;
const fabric_network_1 = require("fabric-network");
const fs = require("fs");
const path = require("path");
const buildCCPOrg1 = () => {
    // load the common connection configuration file
    const ccpPath = path.resolve(__dirname, '..', '..', '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    const fileExists = fs.existsSync(ccpPath);
    if (!fileExists) {
        throw new Error(`no such file or directory: ${ccpPath}`);
    }
    const contents = fs.readFileSync(ccpPath, 'utf8');
    // build a JSON object from the file contents
    const ccp = JSON.parse(contents);
    // console.log(ccp)
    console.log(`Loaded the network configuration located at ${ccpPath}`);
    return ccp;
};
exports.buildCCPOrg1 = buildCCPOrg1;
const buildCCPOrg2 = () => {
    // load the common connection configuration file
    const ccpPath = path.resolve(__dirname, '..', '..', '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org2.example.com', 'connection-org2.json');
    const fileExists = fs.existsSync(ccpPath);
    if (!fileExists) {
        throw new Error(`no such file or directory: ${ccpPath}`);
    }
    const contents = fs.readFileSync(ccpPath, 'utf8');
    // build a JSON object from the file contents
    const ccp = JSON.parse(contents);
    console.log(`Loaded the network configuration located at ${ccpPath}`);
    return ccp;
};
exports.buildCCPOrg2 = buildCCPOrg2;
const buildWallet = async (walletPath) => {
    // Create a new  wallet : Note that wallet is for managing identities.
    let wallet;
    if (walletPath) {
        wallet = await fabric_network_1.Wallets.newFileSystemWallet(walletPath);
        console.log(`Built a file system wallet at ${walletPath}`);
    }
    else {
        wallet = await fabric_network_1.Wallets.newInMemoryWallet();
        console.log('Built an in memory wallet');
    }
    return wallet;
};
exports.buildWallet = buildWallet;
const prettyJSONString = (inputString) => {
    if (inputString) {
        return JSON.stringify(JSON.parse(inputString), null, 2);
    }
    else {
        return inputString;
    }
};
exports.prettyJSONString = prettyJSONString;
//# sourceMappingURL=AppUtil.js.map