import * as FabricCAServices from 'fabric-ca-client';
/**
 *
 * @param {*} ccp
 */
declare const buildCAClient: (ccp: Record<string, any>, caHostName: string) => FabricCAServices;
declare const registerUser: (req: any, res: any) => Promise<any>;
declare const uploadFile: (req: any, res: any) => Promise<any>;
declare const validateDocumentOnChain: (req: any, res: any) => Promise<any>;
declare const getAllAssets: (req: any, res: any) => void;
declare const login: (req: any, res: any) => void;
export { buildCAClient, uploadFile, validateDocumentOnChain, getAllAssets, login, registerUser };
