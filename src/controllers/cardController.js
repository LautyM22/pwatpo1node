import { getAllCards, getCardById, createCard, updateCard, deleteCard } from "../services/card.Service.js";
import { getLanguage } from "../utils/i18n.js";
import { validateCard } from "../validations/card.validations.js";

export async function getAllCardsController(req, res) {
  try {
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    const langFinal = getLanguage(req);
    const { cards, total } = await getAllCards(page, limit, langFinal);

    res.setHeader('X-Total-Count', total);
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function getCardByIdController(req, res) {
  try {
    const id = req.params.id;
    
    if (isNaN(id)) {
      return res.status(400).json({ 
        error: "Datos inválidos", 
        details: [{ field: "id", message: "El ID de la carta debe ser un número entero válido" }] 
      });
    }

    const langFinal = getLanguage(req);
    const card = await getCardById(id, langFinal);

    if (card) {
      return res.status(200).json(card);
    }
    
    return res.status(404).json({ error: "Recurso no encontrado" });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function createCardController(req, res) {
  try {
    const errors = validateCard(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ error: "Datos inválidos", details: errors });
    }

    const newCard = await createCard(req.body);
    res.status(201).json(newCard);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function updateCardController(req, res) {
  try {
    const id = req.params.id;
    
    if (isNaN(id)) {
      return res.status(400).json({ 
        error: "Datos inválidos", 
        details: [{ field: "id", message: "El ID de la carta debe ser un número entero válido" }] 
      });
    }

    const errors = validateCard(req.body);
    
    if (errors.length > 0) {
      return res.status(400).json({ error: "Datos inválidos", details: errors });
    }
    
    const updatedCard = await updateCard(id, req.body);
    
    if (!updatedCard) {
      return res.status(404).json({ error: "Recurso no encontrado" });
    }
    
    return res.status(200).json(updatedCard);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function deleteCardController(req, res) {
  try {
    const id = req.params.id;
    
    if (isNaN(id)) {
      return res.status(400).json({ 
        error: "Datos inválidos", 
        details: [{ field: "id", message: "El ID de la carta debe ser un número entero válido" }] 
      });
    }

    const deleted = await deleteCard(id);
    
    if (deleted) {
      return res.status(200).json({ message: "Carta eliminada correctamente" });
    }

    return res.status(404).json({ error: "Recurso no encontrado" });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}