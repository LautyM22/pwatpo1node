import prisma from "../prisma/prismaClient.js";
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

export async function getCardById(id, lang) {
  const card = await prisma.card.findUnique({
    where: { id: parseInt(id) },
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

export async function createCard(body) {
  const card = await prisma.card.create({
    data: {
      cost: body.cost,
      atk: body.atk,
      def: body.def,
      image: body.image,
      typeId: body.typeId,
      rarityId: body.rarityId,
      translations: {
        create: body.translations,
      },
    },
    include: {
      translations: true,
      type: { include: { translations: true } },
      rarity: { include: { translations: true } },
    },
  });

  return mapCardToLang(card, 'es');
}

export async function updateCard(id, body) {
  const card = await prisma.card.findUnique({ where: { id: parseInt(id) } });
  
  if (!card) {
    return null;
  }

  const updatedCard = await prisma.card.update({
    where: { id: parseInt(id) },
    data: {
      cost: body.cost,
      atk: body.atk,
      def: body.def,
      image: body.image,
      typeId: body.typeId,
      rarityId: body.rarityId,
      translations: {
        deleteMany: {},
        create: body.translations,
      },
    },
    include: {
      translations: true,
      type: { include: { translations: true } },
      rarity: { include: { translations: true } },
    },
  });

  return mapCardToLang(updatedCard, 'es');
}

export async function deleteCard(id) {
  const card = await prisma.card.findUnique({ where: { id: parseInt(id) } });
  
  if (!card) {
    return false;
  }

  await prisma.card.delete({ where: { id: parseInt(id) } });
  return true;
}