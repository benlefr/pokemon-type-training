<script lang="ts">
	import TypeChart from '$lib/components/TypeChart.svelte';
	import TypeBadge from '$lib/components/TypeBadge.svelte';
	import PokemonSelector from '$lib/components/PokemonSelector.svelte';
	import { TYPES_SANS_STELLAR, TYPE_INFO } from '$lib/data/typeNames';
	import {
		getWeakTo,
		getStrongAgainst,
		getResistances,
		getImmunities,
		getDualEffectiveness,
		pokemonDefMultiplier
	} from '$lib/data/typeChart';
	import { roster, statTotal, type Pokemon } from '$lib/data/roster';

	// ----- Section 2 : fiche par type -----
	let openType = $state<string | null>(null);

	function toggleType(t: string) {
		openType = openType === t ? null : t;
	}

	function topPokemon(type: string): Pokemon[] {
		return roster
			.filter((p) => p.types.includes(type))
			.sort((a, b) => statTotal(b) - statTotal(a))
			.slice(0, 5);
	}

	// ----- Section 3 : calculateur dual -----
	let d1 = $state('Fire');
	let d2 = $state('Flying');

	const dualRows = $derived(
		TYPES_SANS_STELLAR.map((atk) => ({
			type: atk,
			mult: getDualEffectiveness(atk, d1, d2 === d1 ? null : d2)
		})).sort((a, b) => b.mult - a.mult)
	);

	function multClass(m: number): string {
		if (m === 0) return 'm0';
		if (m <= 0.25) return 'm025';
		if (m < 1) return 'm05';
		if (m === 1) return 'm1';
		if (m < 4) return 'm2';
		return 'm4';
	}

	function multLabel(m: number): string {
		if (m === 0.25) return 'x0.25';
		if (m === 0.5) return 'x0.5';
		return `x${m}`;
	}

	// ----- Section 4 : détail Pokémon -----
	let selectedPokemon = $state<Pokemon | null>(null);

	function pokemonWeaknesses(p: Pokemon) {
		return TYPES_SANS_STELLAR.map((atk) => ({
			type: atk,
			mult: pokemonDefMultiplier(p, atk)
		}))
			.filter((m) => m.mult > 1)
			.sort((a, b) => b.mult - a.mult);
	}
</script>

<h1 class="page-title">Feuilles de révision</h1>

<!-- Section 1 : table 18x18 -->
<section class="block">
	<h2>Table des types 18×18</h2>
	<TypeChart />
</section>

<!-- Section 2 : fiche par type -->
<section class="block">
	<h2>Fiche par type</h2>
	<div class="type-grid">
		{#each TYPES_SANS_STELLAR as t (t)}
			<div class="type-card" class:open={openType === t}>
				<button class="type-card-head" style="--c: {TYPE_INFO[t]?.color}" onclick={() => toggleType(t)}>
					<span class="emoji">{TYPE_INFO[t]?.emoji}</span>
					<span class="fr">{TYPE_INFO[t]?.fr}</span>
					<span class="chev">{openType === t ? '−' : '+'}</span>
				</button>
				{#if openType === t}
					<div class="type-card-body anim-fade-in">
						<p class="en">{t}</p>

						<div class="mini">
							<h4>Battu par</h4>
							<div class="badges">
								{#each getWeakTo(t) as w (w)}<TypeBadge type={w} size="sm" />{/each}
								{#if getWeakTo(t).length === 0}<span class="none">—</span>{/if}
							</div>
						</div>

						<div class="mini">
							<h4>Bat</h4>
							<div class="badges">
								{#each getStrongAgainst(t) as s (s)}<TypeBadge type={s} size="sm" />{/each}
								{#if getStrongAgainst(t).length === 0}<span class="none">—</span>{/if}
							</div>
						</div>

						<div class="mini">
							<h4>Résiste à</h4>
							<div class="badges">
								{#each getResistances(t) as r (r)}<TypeBadge type={r} size="sm" />{/each}
								{#if getResistances(t).length === 0}<span class="none">—</span>{/if}
							</div>
						</div>

						{#if getImmunities(t).length > 0}
							<div class="mini">
								<h4>Immunité contre</h4>
								<div class="badges">
									{#each getImmunities(t) as im (im)}<TypeBadge type={im} size="sm" />{/each}
								</div>
							</div>
						{/if}

						<div class="mini">
							<h4>Top 5 Champions</h4>
							<ul class="top">
								{#each topPokemon(t) as p (p.name)}
									<li>{p.nameFr} <span class="bst">({statTotal(p)})</span></li>
								{/each}
							</ul>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</section>

<!-- Section 3 : calculateur dual -->
<section class="block">
	<h2>Calculateur Dual Type</h2>
	<div class="dual-controls">
		<select bind:value={d1}>
			{#each TYPES_SANS_STELLAR as t (t)}<option value={t}>{TYPE_INFO[t]?.emoji} {TYPE_INFO[t]?.fr}</option>{/each}
		</select>
		<span class="plus">+</span>
		<select bind:value={d2}>
			{#each TYPES_SANS_STELLAR as t (t)}<option value={t}>{TYPE_INFO[t]?.emoji} {TYPE_INFO[t]?.fr}</option>{/each}
		</select>
	</div>

	<div class="dual-grid">
		{#each dualRows as row (row.type)}
			<div class="dual-cell {multClass(row.mult)}">
				<span class="dt-emoji">{TYPE_INFO[row.type]?.emoji}</span>
				<span class="dt-name">{TYPE_INFO[row.type]?.fr}</span>
				<span class="dt-mult">{multLabel(row.mult)}</span>
			</div>
		{/each}
	</div>
</section>

<!-- Section 4 : roster -->
<section class="block">
	<h2>Roster Champions ({roster.length})</h2>
	<PokemonSelector {roster} onselect={(p) => (selectedPokemon = p)} />

	{#if selectedPokemon}
		<div class="poke-detail anim-fade-in">
			<button class="close" onclick={() => (selectedPokemon = null)}>✕</button>
			<div class="pd-head">
				{#if selectedPokemon.thumbnail}<img src={selectedPokemon.thumbnail} alt={selectedPokemon.name} />{/if}
				<div>
					<h3>{selectedPokemon.nameFr} <span class="dex">#{selectedPokemon.dexNumber}</span></h3>
					<p class="en">{selectedPokemon.name} · {selectedPokemon.form}</p>
					<div class="badges">
						{#each selectedPokemon.types as t (t)}<TypeBadge type={t} size="sm" />{/each}
					</div>
					<p class="abilities">Talents : {selectedPokemon.abilities.join(', ') || '—'}</p>
					{#if selectedPokemon.item}<p class="abilities">💎 Objet : {selectedPokemon.item}</p>{/if}
				</div>
			</div>

			<div class="pd-stats">
				{#each Object.entries(selectedPokemon.base) as [k, v] (k)}
					<div class="stat"><span>{k}</span><b>{v}</b></div>
				{/each}
				<div class="stat total"><span>Total</span><b>{statTotal(selectedPokemon)}</b></div>
			</div>

			<h4>Faiblesses défensives</h4>
			<div class="badges">
				{#each pokemonWeaknesses(selectedPokemon) as w (w.type)}
					<span class="weak-pill">
						<TypeBadge type={w.type} size="sm" />
						<b>x{w.mult}</b>
					</span>
				{/each}
				{#if pokemonWeaknesses(selectedPokemon).length === 0}<span class="none">Aucune faiblesse</span>{/if}
			</div>
		</div>
	{/if}
</section>

<style>
	.page-title {
		font-size: 1.8rem;
		font-weight: 900;
		margin: 0 0 18px;
	}

	.block {
		background: var(--panel-soft);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 18px;
		padding: 18px 16px;
		margin-bottom: 20px;
	}

	.block h2 {
		margin: 0 0 14px;
		font-size: 1.25rem;
	}

	.type-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 10px;
		align-items: start;
	}

	.type-card {
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		overflow: hidden;
		background: rgba(0, 0, 0, 0.15);
	}

	.type-card.open {
		grid-column: 1 / -1;
	}

	.type-card-head {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		border: none;
		border-left: 5px solid var(--c);
		background: transparent;
		color: var(--text);
		font-weight: 700;
		cursor: pointer;
	}

	.type-card-head .emoji {
		font-size: 1.2rem;
	}

	.type-card-head .fr {
		flex: 1;
		text-align: left;
	}

	.type-card-head .chev {
		color: var(--muted);
		font-size: 1.2rem;
	}

	.type-card-body {
		padding: 4px 14px 14px;
		display: grid;
		gap: 10px;
	}

	.type-card-body .en {
		margin: 0;
		color: var(--muted);
		font-size: 0.85rem;
	}

	.mini h4 {
		margin: 0 0 6px;
		font-size: 0.85rem;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.badges {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		align-items: center;
	}

	.none {
		color: var(--muted);
	}

	.top {
		margin: 0;
		padding-left: 18px;
		display: grid;
		gap: 2px;
	}

	.top .bst {
		color: var(--muted);
		font-size: 0.8rem;
	}

	.dual-controls {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 14px;
		flex-wrap: wrap;
	}

	.dual-controls select {
		background: var(--panel-soft);
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: var(--text);
		border-radius: 10px;
		padding: 9px 12px;
		font-size: 0.95rem;
	}

	.dual-controls select option {
		background: #1a1b36;
	}

	.plus {
		font-size: 1.4rem;
		font-weight: 800;
		color: var(--muted);
	}

	.dual-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 8px;
	}

	.dual-cell {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 10px;
		border-radius: 10px;
		font-weight: 700;
		border: 1px solid rgba(255, 255, 255, 0.12);
	}

	.dual-cell .dt-name {
		flex: 1;
		font-size: 0.85rem;
	}

	.dual-cell .dt-mult {
		font-size: 0.85rem;
	}

	.m0 {
		background: #000;
		color: #ff8a8a;
	}
	.m025 {
		background: #7c2d12;
	}
	.m05 {
		background: #b45309;
	}
	.m1 {
		background: #374151;
		color: var(--muted);
	}
	.m2 {
		background: #b91c1c;
	}
	.m4 {
		background: #ef4444;
		box-shadow: 0 0 12px rgba(239, 68, 68, 0.6);
	}

	.poke-detail {
		position: relative;
		margin-top: 16px;
		background: rgba(0, 0, 0, 0.25);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 14px;
		padding: 16px;
		display: grid;
		gap: 12px;
	}

	.close {
		position: absolute;
		top: 10px;
		right: 10px;
		background: var(--panel-soft);
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: var(--text);
		border-radius: 8px;
		width: 30px;
		height: 30px;
		cursor: pointer;
	}

	.pd-head {
		display: flex;
		gap: 16px;
		align-items: center;
		flex-wrap: wrap;
	}

	.pd-head img {
		width: 96px;
		height: 96px;
		object-fit: contain;
	}

	.pd-head h3 {
		margin: 0;
	}

	.pd-head .dex {
		color: var(--muted);
		font-size: 0.9rem;
	}

	.pd-head .en {
		margin: 2px 0 8px;
		color: var(--muted);
		font-size: 0.85rem;
	}

	.abilities {
		margin: 8px 0 0;
		color: var(--muted);
		font-size: 0.85rem;
	}

	.pd-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
		gap: 8px;
	}

	.pd-stats .stat {
		background: var(--panel-soft);
		border-radius: 8px;
		padding: 8px;
		display: grid;
		gap: 2px;
		font-size: 0.78rem;
		color: var(--muted);
		text-align: center;
	}

	.pd-stats .stat b {
		color: var(--text);
		font-size: 1rem;
	}

	.pd-stats .total b {
		color: #7f9bff;
	}

	.poke-detail h4 {
		margin: 0;
	}

	.weak-pill {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
</style>
