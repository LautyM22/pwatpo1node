export function flattenCard(card, lang) {
  const cardTranslation = card.translations.find(t => t.language === lang)
    ?? card.translations[0];
  const typeTranslation = card.type.translations.find(t => t.language === lang)
    ?? card.type.translations[0];
  const rarityTranslation = card.rarity.translations.find(t => t.language === lang)
    ?? card.rarity.translations[0];
  return {
    id: card.id,
    cost: card.cost,
    atk: card.atk,
    def: card.def,
    image: card.image,
    name: cardTranslation?.name ?? null,
    description: cardTranslation?.description ?? null,
    type: typeTranslation?.name ?? null,
    rarity: rarityTranslation?.name ?? null,
  };
}