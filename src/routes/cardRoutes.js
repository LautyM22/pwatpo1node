import express from 'express';
import { getAllCardsController, getCardByIdController } from '../controllers/cardController.js';

const router = express.Router();

router.get('/', getAllCardsController);
router.get('/:id', getCardByIdController);

export default router;