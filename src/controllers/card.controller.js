import * as cardService from "../services/card.service.js";
import { getLanguage } from "../utils/i18n.js";
import { validateCard } from "../validations/card.validations.js";

export async function getAllCards(req, res) {
  try {
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    const langFinal = getLanguage(req);
    const { cards, total } = await cardService.getAllCards(page, limit, langFinal);

    res.setHeader('X-Total-Count', total);
    res.status(200).json(cards);
  } catch (error) {
    console.error("Error in getAllCards:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function getCardById(req, res) {
  try {
    const id = req.params.id;
    
    if (isNaN(id)) {
      return res.status(400).json({ 
        error: "Datos inválidos", 
        details: [{ field: "id", message: "El ID de la carta debe ser un número entero válido" }] 
      });
    }

    const langFinal = getLanguage(req);
    const card = await cardService.getCardById(id, langFinal);

    if (card) {
      return res.status(200).json(card);
    }
    
    return res.status(404).json({ error: "Recurso no encontrado" });
  } catch (error) {
    console.error("Error in getCardById:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function createCard(req, res) {
  try {
    const errors = validateCard(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ error: "Datos inválidos", details: errors });
    }

    const newCard = await cardService.createCard(req.body);
    res.status(201).json(newCard);
  } catch (error) {
    console.error("Error in createCard:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function updateCard(req, res) {
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
    
    const updatedCard = await cardService.updateCard(id, req.body);
    
    if (!updatedCard) {
      return res.status(404).json({ error: "Recurso no encontrado" });
    }
    
    return res.status(200).json(updatedCard);
  } catch (error) {
    console.error("Error in updateCard:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function deleteCard(req, res) {
  try {
    const id = req.params.id;
    
    if (isNaN(id)) {
      return res.status(400).json({ 
        error: "Datos inválidos", 
        details: [{ field: "id", message: "El ID de la carta debe ser un número entero válido" }] 
      });
    }

    const deleted = await cardService.deleteCard(id);
    
    if (deleted) {
      return res.status(200).json({ message: "Carta eliminada correctamente" });
    }

    return res.status(404).json({ error: "Recurso no encontrado" });
  } catch (error) {
    console.error("Error in deleteCard:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}