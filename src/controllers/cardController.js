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