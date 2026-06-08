import * as cardService from "../services/card.service.js";
import { getLanguage, mapCardToLang } from "../utils/i18n.js";
import { validateCard } from "../validations/card.validations.js";

/**
 * Endpoint para obtener el listado de cartas.
 * Soporta internacionalización híbrida y paginación opcional.
 * 
 * @type {import('express').RequestHandler}
 */
export async function getAllCards(req, res) {
  try {
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    
    // Resolver el idioma del request
    const lang = getLanguage(req);

    // Obtener entidades ricas del servicio
    const { cards, total } = await cardService.getAllCards(page, limit);

    // Mapear y aplanar cada carta según el idioma
    const formattedCards = cards.map(card => mapCardToLang(card, lang));

    res.setHeader('X-Total-Count', total);
    res.status(200).json(formattedCards);
  } catch (error) {
    console.error("Error in getAllCards:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * Endpoint para obtener el detalle de una carta por ID.
 * 
 * @type {import('express').RequestHandler}
 */
export async function getCardById(req, res) {
  try {
    const id = req.params.id;
    
    if (isNaN(id)) {
      return res.status(400).json({ 
        error: "Datos inválidos", 
        details: [{ field: "id", message: "El ID de la carta debe ser un número entero válido" }] 
      });
    }

    const lang = getLanguage(req);
    const card = await cardService.getCardById(id);

    if (card) {
      const formattedCard = mapCardToLang(card, lang);
      return res.status(200).json(formattedCard);
    }
    
    return res.status(404).json({ error: "Recurso no encontrado" });
  } catch (error) {
    console.error("Error in getCardById:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * Endpoint para crear una nueva carta.
 * 
 * @type {import('express').RequestHandler}
 */
export async function createCard(req, res) {
  try {
    const errors = validateCard(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ error: "Datos inválidos", details: errors });
    }

    // Crear la carta
    const newCard = await cardService.createCard(req.body);

    // Resolver idioma del request y formatear respuesta
    const lang = getLanguage(req);
    const formattedCard = mapCardToLang(newCard, lang);

    res.status(201).json(formattedCard);
  } catch (error) {
    console.error("Error in createCard:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * Endpoint para actualizar una carta existente.
 * 
 * @type {import('express').RequestHandler}
 */
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
    
    // Actualizar la carta
    const updatedCard = await cardService.updateCard(id, req.body);
    
    if (!updatedCard) {
      return res.status(404).json({ error: "Recurso no encontrado" });
    }
    
    // Resolver idioma del request y formatear respuesta
    const lang = getLanguage(req);
    const formattedCard = mapCardToLang(updatedCard, lang);

    return res.status(200).json(formattedCard);
  } catch (error) {
    console.error("Error in updateCard:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * Endpoint para eliminar una carta.
 * 
 * @type {import('express').RequestHandler}
 */
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