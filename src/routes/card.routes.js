import express from 'express';
import { 
  getAllCards, 
  getCardById, 
  createCard, 
  updateCard, 
  deleteCard 
} from '../controllers/card.controller.js';

const router = express.Router();

// GET - Rutas de lectura
router.get('/cards', getAllCards);
router.get('/cards/:id', getCardById);

// POST - Crear carta
router.post('/cards', createCard);

// PUT - Actualizar carta
router.put('/cards/:id', updateCard);

// DELETE - Eliminar carta
router.delete('/cards/:id', deleteCard);

export default router;