import { Router } from 'express';
import * as multer from 'multer'
import { validateDocumentOnChain, uploadFile } from '../../utils/CAUtil';
const router = Router();

const imageFilter = function (req: any, file: any, cb: any) {
    // accept image only
    console.log(file)
    if (!file.originalname.match(/\.(pdf|txt)$/)) {
        return cb(new Error('Only pdf files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: multer.memoryStorage(), fileFilter: imageFilter }); // multer configuration

router.post('/upload' , upload.single('file'), uploadFile );
router.post('/validate', upload.single('file'), validateDocumentOnChain);

export default router;