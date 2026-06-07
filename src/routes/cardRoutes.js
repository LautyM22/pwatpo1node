import express from 'express';
import { 
  getAllCardsController, 
  getCardByIdController,
  createCardController,
  updateCardController,
  deleteCardController
} from '../controllers/cardController.js';

const router = express.Router();

// GET - Rutas de lectura
router.get('/card', getAllCardsController);
router.get('/card/:id', getCardByIdController);

// POST - Crear carta
router.post('/card', createCardController);

// PUT - Actualizar carta
router.put('/card/:id', updateCardController);

// DELETE - Eliminar carta
router.delete('/card/:id', deleteCardController);

export default router;