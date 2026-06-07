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
router.get('/', getAllCardsController);
router.get('/:id', getCardByIdController);

// POST - Crear carta
router.post('/', createCardController);

// PUT - Actualizar carta
router.put('/:id', updateCardController);

// DELETE - Eliminar carta
router.delete('/:id', deleteCardController);

export default router;