import effectiveness from './effectiveness.json';
import { TYPES_SANS_STELLAR } from './typeNames';

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
