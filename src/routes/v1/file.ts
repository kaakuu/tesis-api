import { Router } from 'express';
import * as multer from 'multer'
import { getFiles } from '../../services/media.service';
import { validateDocumentOnChain, uploadFile } from '../../utils/CAUtil';
const router = Router();

const storage = multer.memoryStorage();

const upload = multer({ storage }); // multer configuration

router.post('/upload' , upload.single('file'), uploadFile );
router.get('/files', getFiles );
router.post('/validate', upload.single('file'), validateDocumentOnChain);

export default router;