import { prisma } from "../prisma/prismaClient.js";
import { mapCardToLang } from "../utils/i18n.js";

export async function getAllCards(page, limit, lang) {
  const skip = page && limit ? (page - 1) * limit : undefined;
  const take = limit ? limit : undefined;

  const cards = await prisma.card.findMany({
    include: {
      translations: true,
      type: {
        include: {
          translations: true
        }
      },
      rarity: {
        include: {
          translations: true
        }
      }
    },
    skip,
    take
  });

  const total = await prisma.card.count();
  const flattenedCards = cards.map(card => mapCardToLang(card, lang));

  return {
    cards: flattenedCards,
    total
  };
}

// Obtiene una carta específica por ID
// ...existing code...

export async function getCardById(id, lang) {
  const card = await prisma.card.findUnique({
    where: { id: parseInt(id) },  // Cambiar id por parseInt(id)
    include: {
      translations: true,
      type: {
        include: {
          translations: true
        }
      },
      rarity: {
        include: {
          translations: true
        }
      }
    }
  });

  if (!card) {
    return null;
  }

  return mapCardToLang(card, lang);
}