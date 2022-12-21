/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as FabricCAServices from 'fabric-ca-client';
import { Wallet } from 'fabric-network';
import { NetworkConnection } from './Network-connection';
import { buildWallet } from './AppUtil';
import { BUILD_CCP } from './constants';
import { KJUR, KEYUTIL, X509 } from 'jsrsasign';
import * as CryptoJS from 'crypto-js';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';
import { createFile } from '../services/media.service';

// const adminUserId = 'administrator';
const adminUserPasswd = 'adminpw';

const caCertPath = path.resolve(__dirname, '..', '..', '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'ca', 'ca.org1.example.com-cert.pem');
const caCert = fs.readFileSync(caCertPath, 'utf8');

/**
 *
 * @param {*} ccp
 */
const buildCAClient = ( ccp: Record<string, any>, caHostName: string ): FabricCAServices => {

    // Create a new CA client for interacting with the CA.
    const caInfo = ccp.certificateAuthorities[caHostName]; // lookup CA details from config
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    // console.log(ccp)
    const caClient = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: true }, caInfo.caName);

    console.log(`Built a CA Client named ${caInfo.caName}`);
    return caClient;
};

const enrollAdmin = async ( wallet: Wallet, caClient : FabricCAServices, orgMspId: string, adminUserId : string ) => {
    try {
        caClient
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
        return {user, status: 200};
    } catch (error) {
        console.error(`Failed to enroll admin user : ${error}`);
        return { status: 500, error, msg:`Failed to enroll admin user`};
    }
};

const registerUser = async ( req: any, res: any ) => {
    console.log(JSON.stringify(req.body, null, 2));

    const walletPath = path.join(__dirname, 'wallet');
    const wallet : Wallet = await buildWallet(walletPath);

    const ORG_ID : any = req.body.org;
    const USER_ID : string = req.body.user;
    const role : string = req.body.roles;
    const ADMIN_USER : string = req.body.requestUserId;

    const build_ccp = BUILD_CCP.filter( config => config.organization === ORG_ID );
    const ccp = await build_ccp[0].run();

    const ca_client_name = build_ccp[0].ca_name;
    const affiliation = build_ccp[0].affiliation;

    const caClient = await buildCAClient( ccp, ca_client_name );


    if( req.body.roles === 'admin' ){
        const response = await enrollAdmin(wallet, caClient, ORG_ID, USER_ID );

        return res.status(response.status).send(response);
    }else{
       
        const response = await registerAndEnrollUser(wallet, caClient, USER_ID, role, affiliation, ORG_ID, ADMIN_USER);

        return res.status(response.status).send(response);
    }

}

const registerAndEnrollUser = async ( wallet : Wallet, caClient: FabricCAServices, userId: string, role: string, affiliation: string, ORG_ID: string, adminUserId : string ) => {
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
            return { msg:`An identity for the admin user does not exist in the wallet`, status: 404 };
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
    } catch (err) {
        console.error(`Failed to register user : ${err}`);
        return { msg: 'Failed to register user ', status: 500, err };
    }
}

const uploadFile = async( req: any, res : any ) => {
    try{
        console.log('ACAAAAAAAAAAAA')
        const userId = req.query.user_id;
        const fileLoaded = req.file;
        console.log(fileLoaded)       
        
        const networkConnection = new NetworkConnection();
        
        const wallet = await buildWallet(networkConnection.walletPath);
        
        const identity : any = await wallet.get(userId);
        
        if (!identity) {
            console.log(`An identity for the user ${userId} does not exist in the wallet`);
            return res.status(404).send({ msg:`An identity for the user ${userId} does not exist in the wallet`});
        }

         // calculate Hash from the specified file
        const hashToAction = CryptoJS.SHA256(fileLoaded.buffer.toString('utf8')).toString();
         console.log("Hash of the file: " + hashToAction);

         // extract certificate info from wallet        
         const userPrivateKey = identity.credentials.privateKey;

        const sig = new KJUR.crypto.Signature({"alg": "SHA256withECDSA"});
        sig.init(userPrivateKey, "");
        sig.updateHex(hashToAction);
        const sigValueHex = sig.sign();
        const sigValueBase64 = Buffer.from(sigValueHex, 'hex').toString('base64');
        console.log("Signature: " + sigValueBase64);

        networkConnection.startConnection().then(async response => {
            await response.contract.submitTransaction('CreateAsset', hashToAction, sigValueBase64, new Date().toISOString(), userId, fileLoaded.mimetype);
            console.log('Transacciòn ejecutada correctamente')
            try {
                await createFile(fileLoaded, req.query.filename);            
            } catch (err) {
                console.log(err)
            }
            await response.gateway.disconnect();
            res.status(200).send('Transacciòn ejecutada correctamente');

        }).catch( err =>{
            console.log(err);
            res.status(500).send({err, msg:'error '});
        });

    }catch( err ){
        console.log(err);
        return res.status(500).send({err, msg:'error '});
    }
    
}

const validateDocumentOnChain = async( req: any, res : any ) => {
    try{
        const userId = req.query.user_id;
        const fileLoaded = req.file; 
        
        const networkConnection = new NetworkConnection();

        const wallet = await buildWallet(networkConnection.walletPath);
        const identity : any = await wallet.get(userId);
        
        if (!identity) {
            console.log(`An identity for the user ${userId} does not exist in the wallet`);
            return res.status(404).send({ msg:`An identity for the user ${userId} does not exist in the wallet`});
        }

         // calculate Hash from the specified file
         const hashToAction = CryptoJS.SHA256(fileLoaded.buffer.toString('utf8')).toString();
         console.log("Hash of the file: " + hashToAction);
         const certLoaded = identity.credentials.certificate; 

        networkConnection.startConnection().then(async response => {
            const result = await response.contract.evaluateTransaction('ReadAsset', hashToAction);
            console.log('Transacciòn ejecutada correctamente');
            console.log("Doc record found, created by " + result);


            const certObj = new X509();
            certObj.readCertPEM(certLoaded);
            console.log("Detail of certificate provided")
            console.log("Subject: " + certObj.getSubjectString());
            console.log("Issuer (CA) Subject: " + certObj.getIssuerString());
            console.log("CA Signature validation: " + certObj.verifySignature(KEYUTIL.getKey(caCert)));
            console.log("");
    
            // perform signature checking
            const userPublicKey = KEYUTIL.getKey(certLoaded);
            const recover = new KJUR.crypto.Signature({"alg": "SHA256withECDSA"});
            recover.init(userPublicKey);
            recover.updateHex(hashToAction);

            const signature = JSON.parse(result.toString()).signature;
            const getBackSigValueHex = Buffer.from(signature, 'base64').toString('hex');

            console.log("Signature verified with certificate provided: " + recover.verify(getBackSigValueHex));
            

            await response.gateway.disconnect();
            return res.status(200).send({ result: JSON.parse(result.toString()), msg:'Transacciòn ejecutada correctamente'});

        }).catch( err =>{
            console.log(err);
            fs.unlinkSync(`./${fileLoaded.destination}${fileLoaded.filename}`);
            return res.status(500).send({err, msg: 'El archivo que proporcionó es inválido.'});

        }); 

    }catch( err ){
        console.log(err);
        fs.unlinkSync(`./${req.file.destination}${req.file.filename}`);
        return res.status(500).send({err, msg: 'El archivo que proporcionó es inválido.'});
    }
}

const getAllAssets = (req : any, res : any) => {
    const networkConnection = new NetworkConnection();

    networkConnection.startConnection().then(async response => {
        const result = await response.contract.evaluateTransaction('GetAllAssets');

        await response.gateway.disconnect();

        return res.status(200).send({ data : JSON.parse(result.toString()), msg: 'OK'});


    }).catch( err =>{
        console.log(err);
        return res.status(500).send({ err });
    }); 
}

const login = ( req: any, res: any ) => {
    const url = "http://localhost:8080/auth/login";

    axios({
        method: 'post',
        url: url,
        data: req.body
    }).then( response => {
        // console.log(data)
        return res.status(200).send(response.data);
    }).catch( err =>{
        console.log(err.response.data);
        return res.status(500).send(err.response.data);
    });
}

export {
    buildCAClient,
    uploadFile,
    validateDocumentOnChain,
    getAllAssets,
    login,
    registerUser
};
