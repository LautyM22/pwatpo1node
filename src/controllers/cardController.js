import { getAllCards, getCardById } from "../services/card.Service.js";
import { getLanguage } from "../utils/i18n.js";

export async function getAllCardsController(req, res) {
  const page = parseInt(req.query.page, 10);
  const limit = parseInt(req.query.limit, 10);
  const langFinal = getLanguage(req);
  const { cards, total } = await getAllCards(page, limit, langFinal);

  res.setHeader('X-Total-Count', total);
  res.status(200).json(cards);
}

export async function getCardByIdController(req, res) {
  const id = req.params.id;
  const langFinal = getLanguage(req);
  const card = await getCardById(id, langFinal);

  if (card) {
    return res.status(200).json(card);
  }
  
  return res.status(404).json({ error: "Recurso no encontrado" });
}

export async function createCardController(req, res) {
  const errors = validateCard(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ error: "Datos inválidos", details: errors });
  }

  const newCard = await createCard(req.body);
  res.status(201).json(newCard);
}

export async function updateCardController(req, res) {
  const id = req.params.id;
  const errors = validateCard(req.body);
  
  if (errors.length > 0) {
    return res.status(400).json({ error: "Datos inválidos", details: errors });
  }
  
  const updatedCard = await updateCard(id, req.body);
  
  if (!updatedCard) {
    return res.status(404).json({ error: "Recurso no encontrado" });
  }
  
  return res.status(200).json(updatedCard);
}

export async function deleteCardController(req, res) {
  const id = req.params.id;
  const deleted = await deleteCard(id);
  
  if (deleted) {
    return res.status(200).json({ message: "Carta eliminada correctamente" });
  }

  return res.status(404).json({ error: "Recurso no encontrado" });
}