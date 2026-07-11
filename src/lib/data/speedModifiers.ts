import type { Pokemon } from './roster';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type Weather = 'sun' | 'rain' | 'sand' | 'hail' | null;

export interface SpeedItem {
	name: string;
	nameFr: string;
	emoji: string;
	multiplier: number;
	condition?: string;
}

export const SPEED_ITEMS: SpeedItem[] = [
	{ name: 'Choice Scarf', nameFr: 'Mouchoir Choix', emoji: '🧣', multiplier: 1.5 },
	{ name: 'Iron Ball', nameFr: 'Balle Fer', emoji: '⚫', multiplier: 0.5 },
	{ name: 'Macho Band', nameFr: 'Bandeau Macho', emoji: '💪', multiplier: 0.5 },
	{ name: 'Quick Powder', nameFr: 'Poudre Vite', emoji: '💨', multiplier: 2.0 }
];

export interface SpeedAbility {
	name: string;
	nameFr: string;
	emoji: string;
	multiplier: number;
	condition: string;
}

export const SPEED_ABILITIES: SpeedAbility[] = [
	{ name: 'Chlorophyll', nameFr: 'Chlorophylle', emoji: '☀️', multiplier: 2, condition: 'sun' },
	{ name: 'Swift Swim', nameFr: 'Tempo Rapide', emoji: '🌧️', multiplier: 2, condition: 'rain' },
	{ name: 'Sand Rush', nameFr: 'Ruée Sable', emoji: '🏜️', multiplier: 2, condition: 'sand' },
	{ name: 'Slush Rush', nameFr: 'Ruée Neige', emoji: '❄️', multiplier: 2, condition: 'hail' },
	{
		name: 'Surge Surfer',
		nameFr: 'Surfeur Volt',
		emoji: '⚡',
		multiplier: 2,
		condition: 'electric_terrain'
	},
	{ name: 'Speed Boost', nameFr: 'Turbo', emoji: '🚀', multiplier: 1.5, condition: 'always' },
	{ name: 'Quick Feet', nameFr: 'Pied Rapide', emoji: '👟', multiplier: 1.5, condition: 'status' },
	{ name: 'Unburden', nameFr: 'Léger', emoji: '🪶', multiplier: 2, condition: 'item_consumed' }
];

export const WEATHER_OPTIONS: { id: Exclude<Weather, null>; label: string; emoji: string }[] = [
	{ id: 'sun', label: 'Soleil', emoji: '☀️' },
	{ id: 'rain', label: 'Pluie', emoji: '🌧️' },
	{ id: 'sand', label: 'Sable', emoji: '🏜️' },
	{ id: 'hail', label: 'Grêle', emoji: '❄️' }
];

/** Tire un objet aléatoire (25 % chacun, 25 % aucun objet). */
export function randomItem(): SpeedItem | null {
	const r = Math.floor(Math.random() * (SPEED_ITEMS.length + 1));
	return r < SPEED_ITEMS.length ? SPEED_ITEMS[r] : null;
}

export function getEffectiveSpeed(
	pokemon: Pokemon,
	difficulty: Difficulty,
	weather: Weather = null,
	item?: SpeedItem | null
): { speed: number; modifiers: string[] } {
	let speed = pokemon.base.Speed;
	const mods: string[] = [];

	if (difficulty !== 'easy' && item) {
		const applicable = !(item.name === 'Quick Powder' && pokemon.name !== 'Ditto');
		if (applicable) {
			speed = Math.floor(speed * item.multiplier);
			mods.push(`${item.emoji} ${item.nameFr} (x${item.multiplier})`);
		}
	}

	if (difficulty === 'hard' || difficulty === 'expert') {
		const ab = SPEED_ABILITIES.find(
			(a) =>
				pokemon.abilities.includes(a.name) && (a.condition === 'always' || a.condition === weather)
		);
		if (ab) {
			speed = Math.floor(speed * ab.multiplier);
			mods.push(`${ab.emoji} ${ab.nameFr} (x${ab.multiplier})`);
		}
	}

	return { speed, modifiers: mods };
}
