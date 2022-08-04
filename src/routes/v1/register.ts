import { Router } from 'express';
import { registerUser, login } from '../../utils/CAUtil';

const router = Router();

router.post('/user' , registerUser );
router.post('/login' , login );

export default router;