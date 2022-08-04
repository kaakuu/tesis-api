import { Router } from 'express';
import { getAllAssets } from '../../utils/CAUtil';
import  registerRouter from './register';
import  fileRouter from './file';
class AppRouter{
    router : Router;

    constructor(){
        this.router = Router();
        this._init();
    }

    private _init() : void {
        
        this.router.use('/file', fileRouter);
        this.router.use('/get-all', getAllAssets);
        this.router.use('/enroll', registerRouter);
        this.router.use('/ping', ( req, res ) => {
            res.status(200).send('Server connected!!!');
        });
    }
}


export const appRouter = new AppRouter().router;