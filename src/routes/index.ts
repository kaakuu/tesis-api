import * as express from 'express';
import { appRouter } from './v1';

const router = express.Router();

router.use('/api', appRouter);

export default router;