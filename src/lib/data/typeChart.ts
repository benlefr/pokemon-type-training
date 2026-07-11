import effectiveness from './effectiveness.json';
import { TYPES_SANS_STELLAR } from './typeNames';
import type { Pokemon } from './roster';

type Chart = Record<string, Record<string, number>>;

const chart: Chart = (effectiveness as { chart: Chart }).chart;

/**
 * Multiplicateur brut d'un type attaquant contre un type défenseur.
 * Retourne 1 si l'un des types est inconnu (les statuts éventuels sont ignorés).
 */
export function getEffectiveness(attackingType: string, defendingType: string): number {
	const row = chart[attackingType];
	if (!row) return 1;
	const value = row[defendingType];
	return typeof value === 'number' ? value : 1;
}

/**
 * Multiplicateur d'un type attaquant contre un Pokémon à un ou deux types.
 */
export function getDualEffectiveness(
	attackingType: string,
	defType1: string,
	defType2?: string | null
): number {
	if (!defType2) {
		return getEffectiveness(attackingType, defType1);
	}
	return getEffectiveness(attackingType, defType1) * getEffectiveness(attackingType, defType2);
}

/** Types qui infligent un multiplicateur > 1 à ce type (donc « le battent »). */
export function getWeakTo(type: string): string[] {
	return TYPES_SANS_STELLAR.filter((atk) => getEffectiveness(atk, type) > 1);
}

export interface Matchup {
	type: string;
	multiplier: number;
}

/**
 * Pour un dual type, liste les types d'attaque super efficaces (>1),
 * triés par multiplicateur décroissant (x4 avant x2).
 */
export function getWeakToDual(type1: string, type2: string): Matchup[] {
	return TYPES_SANS_STELLAR.map((atk) => ({
		type: atk,
		multiplier: getDualEffectiveness(atk, type1, type2)
	}))
		.filter((m) => m.multiplier > 1)
		.sort((a, b) => b.multiplier - a.multiplier);
}

/** Types que ce type bat (multiplicateur > 1 en attaque). */
export function getStrongAgainst(type: string): string[] {
	return TYPES_SANS_STELLAR.filter((def) => getEffectiveness(type, def) > 1);
}

/**
 * Pour un dual type, liste les types défenseurs contre lesquels au moins
 * un des deux types est super efficace, avec le meilleur multiplicateur.
 */
export function getStrongAgainstDual(type1: string, type2: string): Matchup[] {
	return TYPES_SANS_STELLAR.map((def) => ({
		type: def,
		multiplier: Math.max(getEffectiveness(type1, def), getEffectiveness(type2, def))
	}))
		.filter((m) => m.multiplier > 1)
		.sort((a, b) => b.multiplier - a.multiplier);
}

/** Types dont le multiplicateur est < 1 mais > 0 contre ce type (résistances). */
export function getResistances(type: string): string[] {
	return TYPES_SANS_STELLAR.filter((atk) => {
		const m = getEffectiveness(atk, type);
		return m < 1 && m > 0;
	});
}

/** Types dont le multiplicateur est 0 contre ce type (immunités). */
export function getImmunities(type: string): string[] {
	return TYPES_SANS_STELLAR.filter((atk) => getEffectiveness(atk, type) === 0);
}

/**
 * Résistances/immunités défensives d'un dual type :
 * types d'attaque dont le multiplicateur combiné est < 1.
 */
export function getResistancesDual(type1: string, type2: string): Matchup[] {
	return TYPES_SANS_STELLAR.map((atk) => ({
		type: atk,
		multiplier: getDualEffectiveness(atk, type1, type2)
	}))
		.filter((m) => m.multiplier < 1)
		.sort((a, b) => a.multiplier - b.multiplier);
}

/**
 * Pour un Pokémon attaquant, calcule le meilleur multiplicateur
 * qu'il peut infliger contre un Pokémon défenseur (1 ou 2 types).
 */
export function getBestOffensiveMultiplier(
	atkTypes: string[],
	defType1: string,
	defType2?: string | null
): number {
	return Math.max(...atkTypes.map((t) => getDualEffectiveness(t, defType1, defType2)));
}

/**
 * Évalue la qualité d'une paire offensive contre un défenseur.
 * Retourne un score: +3 (x4), +1 (x2), 0 (x1), -1 (x0.5 ou moins)
 */
export function matchupScore(
	atkTypes1: string[],
	atkTypes2: string[],
	defType1: string,
	defType2?: string | null
): number {
	const best1 = getBestOffensiveMultiplier(atkTypes1, defType1, defType2);
	const best2 = getBestOffensiveMultiplier(atkTypes2, defType1, defType2);
	const best = Math.max(best1, best2);

	if (best >= 4) return 3;
	if (best >= 2) return 1;
	if (best >= 1) return 0;
	return -1;
}

/**
 * Pour un Pokémon défenseur (1 ou 2 types), multiplicateur subi
 * face à un type d'attaque donné.
 */
export function getWorstDefensiveMultiplier(defTypes: string[], atkType: string): number {
	return getDualEffectiveness(atkType, defTypes[0], defTypes[1] ?? null);
}

/**
 * Modificateurs défensifs "toujours actifs" liés à un talent :
 * multiplie le multiplicateur subi contre certains types.
 * Ex: Épaississeur (Thick Fat) réduit Feu et Glace de moitié.
 */
export const ABILITY_DEF_MODIFIERS: Record<string, Record<string, number>> = {
	'Thick Fat': { Fire: 0.5, Ice: 0.5 },
	Heatproof: { Fire: 0.5 },
	'Water Bubble': { Fire: 0.5 },
	Fluffy: { Fire: 2 },
	'Purifying Salt': { Ghost: 0.5 },
	Levitate: { Ground: 0 },
	'Flash Fire': { Fire: 0 },
	'Well-Baked Body': { Fire: 0 },
	'Volt Absorb': { Electric: 0 },
	'Lightning Rod': { Electric: 0 },
	'Motor Drive': { Electric: 0 },
	'Water Absorb': { Water: 0 },
	'Storm Drain': { Water: 0 },
	'Dry Skin': { Water: 0, Fire: 1.25 },
	'Sap Sipper': { Grass: 0 },
	'Earth Eater': { Ground: 0 }
};

/**
 * Multiplicateur défensif d'un Pokémon face à un type d'attaque,
 * en tenant compte du talent (abilities[0]) s'il modifie les faiblesses.
 */
export function pokemonDefMultiplier(
	pokemon: { types: string[]; abilities: string[] },
	atkType: string
): number {
	let m = getDualEffectiveness(atkType, pokemon.types[0], pokemon.types[1] ?? null);
	const mod = ABILITY_DEF_MODIFIERS[pokemon.abilities?.[0]];
	if (mod && atkType in mod) m *= mod[atkType];
	return m;
}

/**
 * Couverture offensive d'une équipe : pour chaque type défenseur,
 * le meilleur multiplicateur que l'équipe peut infliger.
 */
export function teamOffensiveCoverage(team: Pokemon[]): Map<string, number> {
	const map = new Map<string, number>();
	for (const def of TYPES_SANS_STELLAR) {
		let best = 0;
		for (const mon of team) {
			best = Math.max(best, getStrongAgainstMax(mon.types, def));
		}
		map.set(def, best);
	}
	return map;
}

/** Meilleur multiplicateur offensif des types d'un Pokémon contre un type défenseur unique. */
function getStrongAgainstMax(atkTypes: string[], defType: string): number {
	return Math.max(...atkTypes.map((t) => getEffectiveness(t, defType)));
}

/**
 * Couverture offensive à partir d'un ensemble de types d'attaque :
 * pour chaque type défenseur, le meilleur multiplicateur infligé.
 */
export function coverageFromAttackTypes(attackTypes: string[]): Map<string, number> {
	const uniq = [...new Set(attackTypes)];
	const map = new Map<string, number>();
	for (const def of TYPES_SANS_STELLAR) {
		map.set(def, uniq.length ? Math.max(...uniq.map((t) => getEffectiveness(t, def))) : 0);
	}
	return map;
}

/**
 * Faiblesse défensive d'une équipe : pour chaque type attaquant,
 * le meilleur multiplicateur subi par le membre qui résiste le mieux
 * (min sur l'équipe). Si ce min est élevé, aucun membre ne résiste.
 */
export function teamDefensiveWeakness(team: Pokemon[]): Map<string, number> {
	const map = new Map<string, number>();
	for (const atk of TYPES_SANS_STELLAR) {
		let worst = Infinity;
		for (const mon of team) {
			worst = Math.min(worst, pokemonDefMultiplier(mon, atk));
		}
		map.set(atk, team.length > 0 ? worst : 1);
	}
	return map;
}
