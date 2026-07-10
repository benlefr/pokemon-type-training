// Construit src/lib/data/roster.json à partir de :
//  - battle_data_json/battle_data/Singles + Doubles (liste des Pokémon/formes)
//  - showdown_pokedex.json (types, stats, talents, formes)
//  - pokedex_raw.json (noms français des espèces de base)
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const battleBase = resolve(root, 'battle_data_json/battle_data');
const dex = JSON.parse(readFileSync(resolve(root, 'showdown_pokedex.json'), 'utf8'));
const puru = existsSync(resolve(root, 'pokedex_raw.json'))
	? JSON.parse(readFileSync(resolve(root, 'pokedex_raw.json'), 'utf8'))
	: [];

const toID = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// Noms FR de base par numéro de dex (Purukitto, gen 1-8)
const frByNum = {};
for (const p of puru) if (p.name?.french) frByNum[p.id] = p.name.french;

// Index Showdown par nom normalisé et par clé
const byNorm = {};
for (const [key, e] of Object.entries(dex)) {
	if (!e.name || !e.types) continue;
	byNorm[toID(e.name)] = e;
	byNorm[toID(key)] = e;
}

// Correspondances explicites (formes dont le nom battle_data diffère de Showdown)
const OVERRIDES = {
	'Aegislash Shield Forme': 'Aegislash',
	'Alolan Ninetales': 'Ninetales-Alola',
	'Alolan Raichu': 'Raichu-Alola',
	'Basculegion Female': 'Basculegion-F',
	'Basculegion Male': 'Basculegion',
	'Florges Red Flower': 'Florges',
	'Furfrou Natural Form': 'Furfrou',
	'Galarian Slowbro': 'Slowbro-Galar',
	'Galarian Slowking': 'Slowking-Galar',
	'Galarian Stunfisk': 'Stunfisk-Galar',
	'Gourgeist Jumbo Variety': 'Gourgeist-Super',
	'Gourgeist Large Variety': 'Gourgeist-Large',
	'Gourgeist Small Variety': 'Gourgeist-Small',
	'Hisuian Arcanine': 'Arcanine-Hisui',
	'Hisuian Avalugg': 'Avalugg-Hisui',
	'Hisuian Decidueye': 'Decidueye-Hisui',
	'Hisuian Goodra': 'Goodra-Hisui',
	'Hisuian Samurott': 'Samurott-Hisui',
	'Hisuian Typhlosion': 'Typhlosion-Hisui',
	'Hisuian Zoroark': 'Zoroark-Hisui',
	'Lycanroc Dusk Form': 'Lycanroc-Dusk',
	'Lycanroc Midnight Form': 'Lycanroc-Midnight',
	'Meowstic Female': 'Meowstic-F',
	'Mr. Rime': 'Mr. Rime',
	'Palafin Zero Form': 'Palafin',
	'Paldean Tauros Aqua Breed': 'Tauros-Paldea-Aqua',
	'Paldean Tauros Blaze Breed': 'Tauros-Paldea-Blaze',
	'Paldean Tauros Combat Breed': 'Tauros-Paldea-Combat',
	'Rotom Fan': 'Rotom-Fan',
	'Rotom Frost': 'Rotom-Frost',
	'Rotom Heat': 'Rotom-Heat',
	'Rotom Mow': 'Rotom-Mow',
	'Rotom Wash': 'Rotom-Wash',
	'Vivillon Fancy Pattern': 'Vivillon'
};

// Suffixe FR pour les formes courantes
const FR_FORME = {
	Alola: "d'Alola",
	Galar: 'de Galar',
	Hisui: 'de Hisui',
	Paldea: 'de Paldea',
	Heat: '(Chaleur)',
	Wash: '(Lavage)',
	Frost: '(Froid)',
	Fan: '(Hélice)',
	Mow: '(Tonte)',
	Dusk: '(Crépuscule)',
	Midnight: '(Nocturne)',
	F: '(♀)',
	Small: '(Petit)',
	Large: '(Grand)',
	Super: '(Géant)'
};

function findEntry(name) {
	if (OVERRIDES[name]) {
		const e = byNorm[toID(OVERRIDES[name])];
		if (e) return e;
	}
	return byNorm[toID(name)] || null;
}

// Liste des noms (Singles + Doubles)
const set = new Set();
for (const d of ['Singles', 'Doubles']) {
	for (const f of readdirSync(resolve(battleBase, d))) {
		if (f.endsWith('.json')) set.add(f.replace(/\.+json$/, '').replace(/\.$/, ''));
	}
}
const names = [...set].sort();

const roster = [];
const missing = [];

for (const name of names) {
	const e = findEntry(name);
	if (!e) {
		missing.push(name);
		continue;
	}
	const base = { HP: 0, Attack: 0, Defense: 0, 'Sp. Attack': 0, 'Sp. Defense': 0, Speed: 0 };
	if (e.baseStats) {
		base.HP = e.baseStats.hp;
		base.Attack = e.baseStats.atk;
		base.Defense = e.baseStats.def;
		base['Sp. Attack'] = e.baseStats.spa;
		base['Sp. Defense'] = e.baseStats.spd;
		base.Speed = e.baseStats.spe;
	}

	const baseSpecies = e.baseSpecies || e.name;
	const forme = e.forme || '';
	const spriteId = toID(baseSpecies) + (forme ? '-' + toID(forme) : '');
	const thumbnail = `https://play.pokemonshowdown.com/sprites/gen5/${spriteId}.png`;

	// Nom FR : espèce de base FR + suffixe de forme si connu, sinon nom battle_data
	const baseFr = frByNum[e.num];
	let nameFr;
	if (baseFr) {
		const firstFormeWord = forme.split('-')[0];
		const suffix = FR_FORME[forme] || FR_FORME[firstFormeWord] || (forme ? `(${forme})` : '');
		nameFr = suffix ? `${baseFr} ${suffix}` : baseFr;
	} else {
		nameFr = name;
	}

	roster.push({
		name,
		nameFr,
		dexNumber: e.num,
		types: e.types,
		form: forme || 'Base',
		abilities: e.abilities ? Object.values(e.abilities) : [],
		base,
		thumbnail
	});
}

// --- Méga-évolutions (Showdown) pour les espèces déjà présentes ---
const basePresent = new Set(roster.filter((p) => p.form === 'Base').map((p) => toID(p.name)));
for (const e of Object.values(dex)) {
	if (!e.forme || !/^Mega/.test(e.forme) || !e.baseSpecies || !e.types) continue;
	if (!basePresent.has(toID(e.baseSpecies))) continue;

	const base = { HP: 0, Attack: 0, Defense: 0, 'Sp. Attack': 0, 'Sp. Defense': 0, Speed: 0 };
	if (e.baseStats) {
		base.HP = e.baseStats.hp;
		base.Attack = e.baseStats.atk;
		base.Defense = e.baseStats.def;
		base['Sp. Attack'] = e.baseStats.spa;
		base['Sp. Defense'] = e.baseStats.spd;
		base.Speed = e.baseStats.spe;
	}

	const spriteId = toID(e.baseSpecies) + '-' + toID(e.forme);
	const baseFr = frByNum[e.num];
	const xy = /X$/.test(e.forme) ? ' X' : /Y$/.test(e.forme) ? ' Y' : '';
	const nameFr = baseFr ? `Méga-${baseFr}${xy}` : e.name;

	roster.push({
		name: e.name,
		nameFr,
		dexNumber: e.num,
		types: e.types,
		form: e.forme,
		abilities: e.abilities ? Object.values(e.abilities) : [],
		base,
		thumbnail: `https://play.pokemonshowdown.com/sprites/gen5/${spriteId}.png`,
		item: e.requiredItem || null
	});
}

roster.sort((a, b) => a.dexNumber - b.dexNumber || a.name.localeCompare(b.name));

writeFileSync(resolve(root, 'src/lib/data/roster.json'), JSON.stringify(roster, null, '\t'));
console.log('roster.json écrit :', roster.length, 'Pokémon/formes');
if (missing.length) {
	console.log('NON RÉSOLUS (' + missing.length + ') :');
	console.log(missing.join('\n'));
} else {
	console.log('Toutes les formes ont été résolues ✔');
}
