<script lang="ts">
	import { roster, type Pokemon } from '$lib/data/roster';
	import { TYPES_SANS_STELLAR } from '$lib/data/typeNames';
	import { coverageFromAttackTypes, teamDefensiveWeakness } from '$lib/data/typeChart';
	import TeamSlot from '$lib/components/TeamSlot.svelte';
	import PokemonSelector from '$lib/components/PokemonSelector.svelte';
	import MoveSelector from '$lib/components/MoveSelector.svelte';
	import CoverageChart from '$lib/components/CoverageChart.svelte';
	import SuggestionPanel from '$lib/components/SuggestionPanel.svelte';
	import SimulatorPanel from '$lib/components/SimulatorPanel.svelte';

	let team = $state<(Pokemon | null)[]>([null, null, null, null, null, null]);
	let teamMoves = $state<string[][]>([[], [], [], [], [], []]);
	let selectedSlot = $state<number | null>(null);
	let moveSlot = $state<number | null>(null);
	let activeTab = $state<'analysis' | 'simulator'>('analysis');

	const filledTeam = $derived(team.filter((p): p is Pokemon => p !== null));

	/** Types d'attaque offensifs actifs : attaques choisies sinon STAB (types du Pokémon). */
	const attackTypes = $derived.by(() => {
		const types: string[] = [];
		team.forEach((p, i) => {
			if (!p) return;
			const chosen = (p.moves ?? []).filter(
				(m) => teamMoves[i].includes(m.name) && m.category !== 'Status'
			);
			if (chosen.length > 0) types.push(...chosen.map((m) => m.type));
			else types.push(...p.types);
		});
		return types;
	});

	const coveredCount = $derived.by(() => {
		const off = coverageFromAttackTypes(attackTypes);
		return TYPES_SANS_STELLAR.filter((t) => (off.get(t) ?? 0) >= 2).length;
	});

	const threatCount = $derived.by(() => {
		if (filledTeam.length === 0) return 0;
		const def = teamDefensiveWeakness(filledTeam);
		return TYPES_SANS_STELLAR.filter((t) => (def.get(t) ?? 1) >= 2).length;
	});

	const availableRoster = $derived(
		roster.filter((p) => !team.some((m) => m?.name === p.name))
	);

	function openSlot(index: number) {
		selectedSlot = selectedSlot === index ? null : index;
		moveSlot = null;
	}

	function openMoves(index: number) {
		moveSlot = moveSlot === index ? null : index;
		selectedSlot = null;
	}

	function assign(pokemon: Pokemon) {
		let slot = selectedSlot;
		if (slot === null) slot = team.findIndex((p) => p === null);
		if (slot === -1 || slot === null) return;
		if (team.some((p) => p?.name === pokemon.name)) return;
		team[slot] = pokemon;
		teamMoves[slot] = [];
		selectedSlot = null;
	}

	function remove(index: number) {
		team[index] = null;
		teamMoves[index] = [];
		if (selectedSlot === index) selectedSlot = null;
		if (moveSlot === index) moveSlot = null;
	}

	function toggleMove(index: number, move: string) {
		const cur = teamMoves[index];
		if (cur.includes(move)) teamMoves[index] = cur.filter((m) => m !== move);
		else if (cur.length < 4) teamMoves[index] = [...cur, move];
	}
</script>

<section class="wrap anim-fade-in">
	<div class="head">
		<h1>Team Builder</h1>
		<div class="badges">
			<span class="badge off">Couverts x2+ : <strong>{coveredCount}/18</strong></span>
			<span class="badge def">Menaces x2+ : <strong>{threatCount}/18</strong></span>
		</div>
	</div>

	<div class="team">
		{#each team as p, i (i)}
			<TeamSlot
				pokemon={p}
				index={i}
				active={selectedSlot === i || moveSlot === i}
				moves={teamMoves[i]}
				onclick={() => openSlot(i)}
				onremove={() => remove(i)}
				onmoves={() => openMoves(i)}
			/>
		{/each}
	</div>

	{#if selectedSlot !== null}
		<div class="selector-box">
			<div class="selector-head">
				<span>Choisir un Pokémon pour le slot {selectedSlot + 1}</span>
				<button type="button" class="close" onclick={() => (selectedSlot = null)}>Fermer</button>
			</div>
			<PokemonSelector roster={availableRoster} onselect={assign} />
		</div>
	{/if}

	{#if moveSlot !== null && team[moveSlot]}
		{@const ms = moveSlot}
		<div class="selector-box">
			<div class="selector-head">
				<span>Attaques du slot {ms + 1}</span>
				<button type="button" class="close" onclick={() => (moveSlot = null)}>Fermer</button>
			</div>
			<MoveSelector
				pokemon={team[ms]!}
				selected={teamMoves[ms]}
				ontoggle={(m) => toggleMove(ms, m)}
			/>
		</div>
	{/if}

	<div class="tabs">
		<button class:active={activeTab === 'analysis'} onclick={() => (activeTab = 'analysis')}>
			Analyse
		</button>
		<button class:active={activeTab === 'simulator'} onclick={() => (activeTab = 'simulator')}>
			Simulateur
		</button>
	</div>

	{#if activeTab === 'analysis'}
		<div class="panels">
			<div class="panel">
				<h3>Couverture offensive</h3>
				<p class="panel-note">Basée sur les attaques choisies (STAB par défaut).</p>
				<CoverageChart team={filledTeam} mode="offensive" {attackTypes} />
			</div>
			<div class="panel">
				<h3>Résistances défensives</h3>
				<CoverageChart team={filledTeam} mode="defensive" />
			</div>
			<div class="panel">
				<h3>Suggestions</h3>
				<SuggestionPanel team={filledTeam} roster={availableRoster} onselect={assign} />
			</div>
		</div>
	{:else}
		<div class="panel">
			<h3>Simulateur de combat</h3>
			<SimulatorPanel team={filledTeam} {roster} />
		</div>
	{/if}
</section>

<style>
	.wrap {
		display: grid;
		gap: 16px;
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}

	h1 {
		margin: 0;
		font-size: 1.6rem;
		font-weight: 900;
	}

	.badges {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.badge {
		border-radius: 999px;
		padding: 6px 12px;
		font-size: 0.85rem;
		border: 1px solid rgba(255, 255, 255, 0.12);
	}

	.badge.off {
		background: rgba(34, 197, 94, 0.14);
	}

	.badge.def {
		background: rgba(239, 68, 68, 0.14);
	}

	.team {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
	}

	.selector-box {
		background: var(--panel-soft);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 14px;
		padding: 14px;
		display: grid;
		gap: 12px;
	}

	.selector-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		font-weight: 700;
		font-size: 0.9rem;
	}

	.close {
		border: none;
		background: var(--panel-soft);
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: var(--text);
		border-radius: 999px;
		padding: 6px 14px;
		cursor: pointer;
		font-weight: 700;
	}

	.tabs {
		display: inline-flex;
		background: var(--panel-soft);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 999px;
		padding: 4px;
		gap: 4px;
		width: fit-content;
	}

	.tabs button {
		border: none;
		background: transparent;
		color: var(--muted);
		font-weight: 700;
		font-size: 0.9rem;
		padding: 7px 18px;
		border-radius: 999px;
		cursor: pointer;
	}

	.tabs button.active {
		background: linear-gradient(135deg, #3d7bff, #5565ff);
		color: #fff;
	}

	.panels {
		display: grid;
		gap: 14px;
	}

	.panel {
		background: var(--panel-soft);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 14px;
		padding: 14px;
		display: grid;
		gap: 10px;
	}

	.panel h3 {
		margin: 0;
		font-size: 1rem;
	}

	.panel-note {
		margin: -4px 0 0;
		color: var(--muted);
		font-size: 0.8rem;
	}

	@media (min-width: 640px) {
		.team {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (min-width: 900px) {
		.team {
			grid-template-columns: repeat(6, 1fr);
		}
	}
</style>
