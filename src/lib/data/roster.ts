import rosterData from './roster.json';

export interface BaseStats {
	HP: number;
	Attack: number;
	Defense: number;
	'Sp. Attack': number;
	'Sp. Defense': number;
	Speed: number;
}

export interface Pokemon {
	name: string;
	nameFr: string;
	dexNumber: number;
	types: string[];
	form: string;
	abilities: string[];
	base: BaseStats;
	thumbnail: string;
}

export const roster: Pokemon[] = rosterData as Pokemon[];

/** Total des stats de base d'un Pokémon. */
export function statTotal(p: Pokemon): number {
	return Object.values(p.base).reduce((a, v) => a + v, 0);
}
