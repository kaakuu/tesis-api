"use strict";
/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = exports.login = exports.getAllAssets = exports.validateDocumentOnChain = exports.uploadFile = exports.buildCAClient = void 0;
const FabricCAServices = require("fabric-ca-client");
const Network_connection_1 = require("./Network-connection");
const AppUtil_1 = require("./AppUtil");
const constants_1 = require("./constants");
const jsrsasign_1 = require("jsrsasign");
const CryptoJS = require("crypto-js");
const path = require("path");
const fs = require("fs");
const axios_1 = require("axios");
const media_service_1 = require("../services/media.service");
// const adminUserId = 'administrator';
const adminUserPasswd = 'adminpw';
const caCertPath = path.resolve(__dirname, '..', '..', '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'ca', 'ca.org1.example.com-cert.pem');
const caCert = fs.readFileSync(caCertPath, 'utf8');
/**
 *
 * @param {*} ccp
 */
const buildCAClient = (ccp, caHostName) => {
    // Create a new CA client for interacting with the CA.
    const caInfo = ccp.certificateAuthorities[caHostName]; // lookup CA details from config
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    // console.log(ccp)
    const caClient = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: true }, caInfo.caName);
    console.log(`Built a CA Client named ${caInfo.caName}`);
    return caClient;
};
exports.buildCAClient = buildCAClient;
const enrollAdmin = async (wallet, caClient, orgMspId, adminUserId) => {
    try {
        caClient;
        // Check to see if we've already enrolled the admin user.
        const identity = await wallet.get(adminUserId);
        if (identity) {
            console.log('An identity for the admin user already exists in the wallet');
            return { msg: 'identity already exists', status: 400, identity };
        }
        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await caClient.enroll({ enrollmentID: 'admin', enrollmentSecret: adminUserPasswd });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: orgMspId,
            type: 'X.509',
        };
        const user = await wallet.put(adminUserId, x509Identity);
        console.log('Successfully enrolled admin user and imported it into the wallet');
        return { user, status: 200 };
    }
    catch (error) {
        console.error(`Failed to enroll admin user : ${error}`);
        return { status: 500, error, msg: `Failed to enroll admin user` };
    }
};
const registerUser = async (req, res) => {
    console.log(JSON.stringify(req.body, null, 2));
    const walletPath = path.join(__dirname, 'wallet');
    const wallet = await (0, AppUtil_1.buildWallet)(walletPath);
    const ORG_ID = req.body.org;
    const USER_ID = req.body.user;
    const role = req.body.roles;
    const ADMIN_USER = req.body.requestUserId;
    const build_ccp = constants_1.BUILD_CCP.filter(config => config.organization === ORG_ID);
    const ccp = await build_ccp[0].run();
    const ca_client_name = build_ccp[0].ca_name;
    const affiliation = build_ccp[0].affiliation;
    const caClient = await buildCAClient(ccp, ca_client_name);
    if (req.body.roles === 'admin') {
        const response = await enrollAdmin(wallet, caClient, ORG_ID, USER_ID);
        return res.status(response.status).send(response);
    }
    else {
        const response = await registerAndEnrollUser(wallet, caClient, USER_ID, role, affiliation, ORG_ID, ADMIN_USER);
        return res.status(response.status).send(response);
    }
};
exports.registerUser = registerUser;
const registerAndEnrollUser = async (wallet, caClient, userId, role, affiliation, ORG_ID, adminUserId) => {
    try {
        // Check to see if we've already enrolled the user
        const userIdentity = await wallet.get(userId);
        if (userIdentity) {
            console.log(`An identity for the user ${userId} already exists in the wallet`);
            return { msg: `An identity for the user ${userId} already exists in the wallet`, status: 400 };
        }
        // Must use an admin to register a new user
        const adminIdentity = await wallet.get(adminUserId);
        if (!adminIdentity) {
            console.log('An identity for the admin user does not exist in the wallet');
            console.log('Enroll the admin user before retrying');
            return { msg: `An identity for the admin user does not exist in the wallet`, status: 404 };
        }
        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, adminUserId);
        // Register the user, enroll the user, and import the new identity into the wallet.
        // if affiliation is specified by client, the affiliation value must be configured in CA
        const secret = await caClient.register({
            affiliation,
            enrollmentID: userId,
            role,
        }, adminUser);
        const enrollment = await caClient.enroll({
            enrollmentID: userId,
            enrollmentSecret: secret,
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: ORG_ID,
            type: 'X.509',
        };
        await wallet.put(userId, x509Identity);
        console.log(`Successfully registered and enrolled user ${userId} and imported it into the wallet`);
        return { msg: `Successfully registered and enrolled user ${userId} and imported it into the wallet `, status: 200 };
    }
    catch (err) {
        console.error(`Failed to register user : ${err}`);
        return { msg: 'Failed to register user ', status: 500, err };
    }
};
const uploadFile = async (req, res) => {
    try {
        console.log('ACAAAAAAAAAAAA');
        const userId = req.query.user_id;
        const fileLoaded = req.file;
        console.log(fileLoaded);
        try {
            await (0, media_service_1.createFile)(fileLoaded, req.query.filename);
        }
        catch (err) {
            console.log(err);
        }
        const networkConnection = new Network_connection_1.NetworkConnection();
        const wallet = await (0, AppUtil_1.buildWallet)(networkConnection.walletPath);
        const identity = await wallet.get(userId);
        if (!identity) {
            console.log(`An identity for the user ${userId} does not exist in the wallet`);
            return res.status(404).send({ msg: `An identity for the user ${userId} does not exist in the wallet` });
        }
        // calculate Hash from the specified file
        const hashToAction = CryptoJS.SHA256(fileLoaded.buffer.toString('utf8')).toString();
        console.log("Hash of the file: " + hashToAction);
        // extract certificate info from wallet        
        const userPrivateKey = identity.credentials.privateKey;
        const sig = new jsrsasign_1.KJUR.crypto.Signature({ "alg": "SHA256withECDSA" });
        sig.init(userPrivateKey, "");
        sig.updateHex(hashToAction);
        const sigValueHex = sig.sign();
        const sigValueBase64 = Buffer.from(sigValueHex, 'hex').toString('base64');
        console.log("Signature: " + sigValueBase64);
        networkConnection.startConnection().then(async (response) => {
            await response.contract.submitTransaction('CreateAsset', hashToAction, sigValueBase64, new Date().toISOString(), userId, fileLoaded.mimetype);
            console.log('Transacciòn ejecutada correctamente');
            try {
                await (0, media_service_1.createFile)(fileLoaded, req.query.filename);
            }
            catch (err) {
                console.log(err);
            }
            await response.gateway.disconnect();
            res.status(200).send('Transacciòn ejecutada correctamente');
        }).catch(err => {
            console.log(err);
            res.status(500).send({ err, msg: 'error ' });
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err, msg: 'error ' });
    }
};
exports.uploadFile = uploadFile;
const validateDocumentOnChain = async (req, res) => {
    try {
        const userId = req.query.user_id;
        const fileLoaded = req.file;
        const networkConnection = new Network_connection_1.NetworkConnection();
        const wallet = await (0, AppUtil_1.buildWallet)(networkConnection.walletPath);
        const identity = await wallet.get(userId);
        if (!identity) {
            console.log(`An identity for the user ${userId} does not exist in the wallet`);
            return res.status(404).send({ msg: `An identity for the user ${userId} does not exist in the wallet` });
        }
        // calculate Hash from the specified file
        const hashToAction = CryptoJS.SHA256(fileLoaded.buffer.toString('utf8')).toString();
        console.log("Hash of the file: " + hashToAction);
        const certLoaded = identity.credentials.certificate;
        networkConnection.startConnection().then(async (response) => {
            const result = await response.contract.evaluateTransaction('ReadAsset', hashToAction);
            console.log('Transacciòn ejecutada correctamente');
            console.log("Doc record found, created by " + result);
            const certObj = new jsrsasign_1.X509();
            certObj.readCertPEM(certLoaded);
            console.log("Detail of certificate provided");
            console.log("Subject: " + certObj.getSubjectString());
            console.log("Issuer (CA) Subject: " + certObj.getIssuerString());
            console.log("CA Signature validation: " + certObj.verifySignature(jsrsasign_1.KEYUTIL.getKey(caCert)));
            console.log("");
            // perform signature checking
            const userPublicKey = jsrsasign_1.KEYUTIL.getKey(certLoaded);
            const recover = new jsrsasign_1.KJUR.crypto.Signature({ "alg": "SHA256withECDSA" });
            recover.init(userPublicKey);
            recover.updateHex(hashToAction);
            const signature = JSON.parse(result.toString()).signature;
            const getBackSigValueHex = Buffer.from(signature, 'base64').toString('hex');
            console.log("Signature verified with certificate provided: " + recover.verify(getBackSigValueHex));
            await response.gateway.disconnect();
            return res.status(200).send({ result: JSON.parse(result.toString()), msg: 'Transacciòn ejecutada correctamente' });
        }).catch(err => {
            console.log(err);
            fs.unlinkSync(`./${fileLoaded.destination}${fileLoaded.filename}`);
            return res.status(500).send({ err, msg: 'El archivo que proporcionó es inválido.' });
        });
    }
    catch (err) {
        console.log(err);
        fs.unlinkSync(`./${req.file.destination}${req.file.filename}`);
        return res.status(500).send({ err, msg: 'El archivo que proporcionó es inválido.' });
    }
};
exports.validateDocumentOnChain = validateDocumentOnChain;
const getAllAssets = (req, res) => {
    const networkConnection = new Network_connection_1.NetworkConnection();
    networkConnection.startConnection().then(async (response) => {
        const result = await response.contract.evaluateTransaction('GetAllAssets');
        await response.gateway.disconnect();
        return res.status(200).send({ data: JSON.parse(result.toString()), msg: 'OK' });
    }).catch(err => {
        console.log(err);
        return res.status(500).send({ err });
    });
};
exports.getAllAssets = getAllAssets;
const login = (req, res) => {
    const url = "http://localhost:8080/auth/login";
    (0, axios_1.default)({
        method: 'post',
        url: url,
        data: req.body
    }).then(response => {
        // console.log(data)
        return res.status(200).send(response.data);
    }).catch(err => {
        console.log(err.response.data);
        return res.status(500).send(err.response.data);
    });
};
exports.login = login;
//# sourceMappingURL=CAUtil.js.map