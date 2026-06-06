import { prisma } from "../prisma/prismaClient.js";
import { flattenCard } from "../utils/flattenCard.js";

// Función auxiliar: determina el idioma según la estrategia híbrida
export async function getLanguage(queryLang, acceptLanguage) {
  // TODO: Validar queryLang primero
  if (queryLang && [ 'es', 'en' ].includes(queryLang)) {
    return queryLang;
  }
  // TODO: Si no es válido, validar acceptLanguage
    if (acceptLanguage) {
        const acceptedLangs = acceptLanguage.split(',').map(lang => lang.trim().split(';')[0]);
        for (const lang of acceptedLangs) {
            if (['es', 'en'].includes(lang)) {
                return lang;
            }
        }
    } 
    
  return 'es';
}


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
  
  const flattenedCards = cards.map(card => flattenCard(card, lang));
  return {
    cards: flattenedCards,
    total
    };
}

// Obtiene una carta específica por ID
export async function getCardById(id, lang) {
  // TODO: Hacer consulta a BD con prisma.card.findUnique()
  const card = await prisma.card.findUnique({
    where: { id },
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
  
  if (!card) return null;

  return flattenCard(card, lang);
}