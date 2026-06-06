import express from 'express';
import { getAllCardsController, getCardByIdController } from '../controllers/cardController.js';

const router = express.Router();

router.get('/cards', getAllCardsController);
router.get('/cards/:id', getCardByIdController);

export default router;