export interface TypeInfo {
	/** clé anglaise utilisée dans effectiveness.json */
	key: string;
	/** nom français */
	fr: string;
	/** emoji représentatif */
	emoji: string;
	/** couleur hex du type */
	color: string;
}

export const TYPE_INFO: Record<string, TypeInfo> = {
	Normal: { key: 'Normal', fr: 'Normal', emoji: '⚪', color: '#A8A878' },
	Fire: { key: 'Fire', fr: 'Feu', emoji: '🔥', color: '#F08030' },
	Water: { key: 'Water', fr: 'Eau', emoji: '💧', color: '#6890F0' },
	Electric: { key: 'Electric', fr: 'Électrik', emoji: '⚡', color: '#F8D030' },
	Grass: { key: 'Grass', fr: 'Plante', emoji: '🌿', color: '#78C850' },
	Ice: { key: 'Ice', fr: 'Glace', emoji: '🧊', color: '#98D8D8' },
	Fighting: { key: 'Fighting', fr: 'Combat', emoji: '🥊', color: '#C03028' },
	Poison: { key: 'Poison', fr: 'Poison', emoji: '☠️', color: '#A040A0' },
	Ground: { key: 'Ground', fr: 'Sol', emoji: '🌍', color: '#E0C068' },
	Flying: { key: 'Flying', fr: 'Vol', emoji: '🪶', color: '#A890F0' },
	Psychic: { key: 'Psychic', fr: 'Psy', emoji: '🔮', color: '#F85888' },
	Bug: { key: 'Bug', fr: 'Insecte', emoji: '🐛', color: '#A8B820' },
	Rock: { key: 'Rock', fr: 'Roche', emoji: '🪨', color: '#B8A038' },
	Ghost: { key: 'Ghost', fr: 'Spectre', emoji: '👻', color: '#705898' },
	Dragon: { key: 'Dragon', fr: 'Dragon', emoji: '🐉', color: '#7038F8' },
	Dark: { key: 'Dark', fr: 'Ténèbres', emoji: '🌑', color: '#705848' },
	Steel: { key: 'Steel', fr: 'Acier', emoji: '⚙️', color: '#B8B8D0' },
	Fairy: { key: 'Fairy', fr: 'Fée', emoji: '🧚', color: '#EE99AC' },
	Stellar: { key: 'Stellar', fr: 'Stellaire', emoji: '✨', color: '#4A90D9' }
};

/** Toutes les clés de type, Stellar inclus. */
export const TYPE_KEYS: string[] = [
	'Normal',
	'Fire',
	'Water',
	'Electric',
	'Grass',
	'Ice',
	'Fighting',
	'Poison',
	'Ground',
	'Flying',
	'Psychic',
	'Bug',
	'Rock',
	'Ghost',
	'Dragon',
	'Dark',
	'Steel',
	'Fairy',
	'Stellar'
];

/** Les 18 types de combat, sans Stellar. */
export const TYPES_SANS_STELLAR: string[] = TYPE_KEYS.filter((t) => t !== 'Stellar');

/** Nom français d'un type (fallback sur la clé). */
export function frName(key: string): string {
	return TYPE_INFO[key]?.fr ?? key;
}

/** Emoji d'un type. */
export function emoji(key: string): string {
	return TYPE_INFO[key]?.emoji ?? '❓';
}

/** Couleur d'un type. */
export function typeColor(key: string): string {
	return TYPE_INFO[key]?.color ?? '#374151';
}
