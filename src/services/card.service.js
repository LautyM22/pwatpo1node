import prisma from "../prisma/prismaClient.js";

/**
 * Obtiene todas las cartas de la base de datos con paginación opcional.
 * Retorna las entidades relacionales ricas de Prisma.
 * 
 * @param {number} page - Número de página (1-indexed).
 * @param {number} limit - Cantidad máxima de registros por página.
 * @returns {Promise<{ cards: Array<Object>, total: number }>}
 */
export async function getAllCards(page, limit) {
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
    orderBy: { id: 'asc' }, // Orden estable
    skip,
    take
  });

  const total = await prisma.card.count();

  return {
    cards,
    total
  };
}

/**
 * Obtiene una carta específica por su ID con todas sus relaciones relativas.
 * 
 * @param {number|string} id - Identificador único de la carta.
 * @returns {Promise<Object|null>}
 */
export async function getCardById(id) {
  return prisma.card.findUnique({
    where: { id: parseInt(id, 10) },
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
}

/**
 * Crea una nueva carta y sus traducciones asociadas.
 * Retorna la entidad rica de Prisma.
 * 
 * @param {Object} body - Datos del body.
 * @returns {Promise<Object>}
 */
export async function createCard(body) {
  return prisma.card.create({
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
}

/**
 * Actualiza una carta existente y recrea sus traducciones asociadas.
 * Retorna la entidad rica o null si no se encuentra.
 * 
 * @param {number|string} id - ID de la carta.
 * @param {Object} body - Datos a actualizar.
 * @returns {Promise<Object|null>}
 */
export async function updateCard(id, body) {
  const card = await prisma.card.findUnique({ where: { id: parseInt(id, 10) } });
  
  if (!card) {
    return null;
  }

  return prisma.card.update({
    where: { id: parseInt(id, 10) },
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
}

/**
 * Elimina una carta de la base de datos por su ID.
 * 
 * @param {number|string} id - ID de la carta.
 * @returns {Promise<boolean>} True si se eliminó, false si no existía.
 */
export async function deleteCard(id) {
  const card = await prisma.card.findUnique({ where: { id: parseInt(id, 10) } });
  
  if (!card) {
    return false;
  }

  await prisma.card.delete({ where: { id: parseInt(id, 10) } });
  return true;
}