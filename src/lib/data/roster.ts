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
	/** Objet requis (méga-gemme) pour les méga-évolutions. */
	item?: string | null;
}

/** Vrai si le Pokémon est une méga-évolution. */
export function isMega(p: Pokemon): boolean {
	return /Mega/.test(p.form);
}

export const roster: Pokemon[] = rosterData as Pokemon[];

/** Total des stats de base d'un Pokémon. */
export function statTotal(p: Pokemon): number {
	return Object.values(p.base).reduce((a, v) => a + v, 0);
}
