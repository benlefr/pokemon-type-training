<script lang="ts">
	import { roster, type Pokemon } from '$lib/data/roster';
	import { TYPE_INFO } from '$lib/data/typeNames';
	import {
		getDualEffectiveness,
		getBestOffensiveMultiplier,
		matchupScore
	} from '$lib/data/typeChart';
	import ScoreBar from '$lib/components/ScoreBar.svelte';
	import DifficultyToggle from '$lib/components/DifficultyToggle.svelte';
	import EnemyPokemonCard from '$lib/components/EnemyPokemonCard.svelte';
	import PoolPokemonCard from '$lib/components/PoolPokemonCard.svelte';
	import TypeBadge from '$lib/components/TypeBadge.svelte';

	const ROUND_MAX = 9;

	let enemies = $state<Pokemon[]>([]);
	let pool = $state<Pokemon[]>([]);
	let selected = $state<Pokemon[]>([]);
	let roundScore = $state(0);
	let totalScore = $state(0);
	let totalPossible = $state(0);
	let streak = $state(0);
	let answered = $state(false);
	let showResult = $state(false);
	let difficulty = $state<'single' | 'dual'>('dual');

	function pickRandom<T>(arr: T[], n: number, exclude: (item: T) => boolean = () => false): T[] {
		const out: T[] = [];
		const pouch = arr.filter((x) => !exclude(x));
		while (out.length < n && pouch.length > 0) {
			const i = Math.floor(Math.random() * pouch.length);
			out.push(pouch.splice(i, 1)[0]);
		}
		return out;
	}

	function withDifficultyTypes(p: Pokemon): Pokemon {
		return difficulty === 'single' ? { ...p, types: p.types.slice(0, 1) } : p;
	}

	function startRound() {
		const rawEnemies = pickRandom(roster, 2);
		enemies = rawEnemies.map(withDifficultyTypes);
		const enemyNames = new Set(rawEnemies.map((e) => e.name));
		pool = pickRandom(roster, 6, (p) => enemyNames.has(p.name));
		selected = [];
		roundScore = 0;
		answered = false;
		showResult = false;
	}

	function selectPokemon(pokemon: Pokemon) {
		if (answered) return;
		const idx = selected.findIndex((p) => p.name === pokemon.name);
		if (idx !== -1) {
			selected = selected.filter((_, i) => i !== idx);
		} else if (selected.length < 2) {
			selected = [...selected, pokemon];
		}
	}

	function isSelected(p: Pokemon): boolean {
		return selected.some((s) => s.name === p.name);
	}

	function noDefensiveWeakness(): boolean {
		return selected.every((mon) =>
			enemies.every((enemy) =>
				enemy.types.every((et) => getDualEffectiveness(et, mon.types[0], mon.types[1] ?? null) <= 1)
			)
		);
	}

	function calculateRoundScore(): number {
		let score = 0;

		for (const enemy of enemies) {
			const [t1, t2] = enemy.types;
			score += matchupScore(selected[0].types, selected[1].types, t1, t2 ?? null);
		}

		const bothCovered = enemies.every((e) => {
			const [t1, t2] = e.types;
			const best = Math.max(
				getBestOffensiveMultiplier(selected[0].types, t1, t2 ?? null),
				getBestOffensiveMultiplier(selected[1].types, t1, t2 ?? null)
			);
			return best >= 2;
		});
		if (bothCovered) score += 2;

		if (noDefensiveWeakness()) score += 1;

		return score;
	}

	function validate() {
		if (selected.length !== 2 || answered) return;
		roundScore = calculateRoundScore();
		totalScore += roundScore;
		totalPossible += ROUND_MAX;
		streak = roundScore > 0 ? streak + 1 : 0;
		answered = true;
		showResult = true;
	}

	interface MatchupDetail {
		enemy: Pokemon;
		bestType: string;
		multiplier: number;
	}

	function bestAttackAgainst(enemy: Pokemon): MatchupDetail {
		const [t1, t2] = enemy.types;
		let bestType = selected[0]?.types[0] ?? '';
		let multiplier = -1;
		for (const mon of selected) {
			for (const at of mon.types) {
				const m = getDualEffectiveness(at, t1, t2 ?? null);
				if (m > multiplier) {
					multiplier = m;
					bestType = at;
				}
			}
		}
		return { enemy, bestType, multiplier };
	}

	const details = $derived(showResult ? enemies.map(bestAttackAgainst) : []);

	function multClass(m: number): 'good' | 'neutral' | 'bad' {
		if (m >= 2) return 'good';
		if (m >= 1) return 'neutral';
		return 'bad';
	}

	function multLabel(m: number): string {
		if (m === 0) return 'x0';
		if (m < 1) return `x${m}`;
		return `x${m}`;
	}

	const resultMessage = $derived(
		roundScore >= 8
			? 'Parfait !'
			: roundScore >= 5
				? 'Excellent !'
				: roundScore >= 2
					? 'Pas mal !'
					: 'Continue !'
	);

	function onDifficultyChange() {
		startRound();
	}

	startRound();
</script>

<section class="wrap anim-fade-in">
	<div class="top">
		<ScoreBar score={totalScore} total={totalPossible} {streak} />
		<DifficultyToggle bind:mode={difficulty} onchange={onDifficultyChange} />
	</div>

	<h2 class="section-title threat">Adversaires</h2>
	<div class="enemies">
		{#each enemies as enemy (enemy.name)}
			<EnemyPokemonCard pokemon={enemy} {difficulty} />
		{/each}
	</div>

	<h2 class="section-title">Votre sélection</h2>
	<div class="selection">
		{#each [0, 1] as slot (slot)}
			{#if selected[slot]}
				<div class="slot filled">
					<img src={selected[slot].thumbnail} alt={selected[slot].name} />
					<span class="slot-name">{selected[slot].nameFr}</span>
					<span class="slot-types">
						{#each selected[slot].types as t (t)}
							<span class="pill" style="background: {TYPE_INFO[t]?.color}">{TYPE_INFO[t]?.emoji}</span>
						{/each}
					</span>
				</div>
			{:else}
				<div class="slot empty">
					<span>Emplacement {slot + 1}</span>
				</div>
			{/if}
		{/each}
	</div>

	<h2 class="section-title">Votre stock</h2>
	<div class="pool">
		{#each pool as p (p.name)}
			<PoolPokemonCard
				pokemon={p}
				selected={isSelected(p)}
				disabled={answered || (!isSelected(p) && selected.length >= 2)}
				onclick={() => selectPokemon(p)}
			/>
		{/each}
	</div>

	<div class="actions">
		<button class="validate" disabled={selected.length !== 2 || answered} onclick={validate}>
			Valider
		</button>
	</div>
</section>

{#if showResult}
	<div class="overlay" role="dialog" aria-modal="true">
		<div class="modal anim-fade-in">
			<h3 class="msg">{resultMessage}</h3>
			<p class="round-score">
				Round : <strong class:pos={roundScore > 0} class:neg={roundScore < 0}>{roundScore}</strong>
				/ {ROUND_MAX}
			</p>

			<div class="matchups">
				{#each details as d (d.enemy.name)}
					<div class="matchup">
						<img src={d.enemy.thumbnail} alt={d.enemy.name} />
						<div class="matchup-info">
							<span class="mu-name">{d.enemy.nameFr}</span>
							<span class="mu-types">
								{#each d.enemy.types as t (t)}
									<TypeBadge type={t} size="sm" placed />
								{/each}
							</span>
						</div>
						<div class="matchup-best">
							<TypeBadge type={d.bestType} size="sm" placed />
							<span class="mult {multClass(d.multiplier)}">{multLabel(d.multiplier)}</span>
						</div>
					</div>
				{/each}
			</div>

			<button class="next" onclick={startRound}>Round suivant</button>
		</div>
	</div>
{/if}

<style>
	.wrap {
		display: grid;
		gap: 14px;
	}

	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}

	.section-title {
		margin: 6px 0 0;
		font-size: 1rem;
		text-transform: uppercase;
		letter-spacing: 1.2px;
		color: var(--muted);
	}

	.section-title.threat {
		color: #ff9a8a;
	}

	.enemies {
		display: grid;
		grid-template-columns: 1fr;
		gap: 12px;
	}

	.selection {
		display: grid;
		grid-template-columns: 1fr;
		gap: 12px;
	}

	.slot {
		border-radius: 14px;
		min-height: 110px;
		display: grid;
		justify-items: center;
		align-content: center;
		gap: 4px;
		padding: 12px;
	}

	.slot.empty {
		border: 2px dashed rgba(255, 255, 255, 0.18);
		color: var(--muted);
		font-size: 0.9rem;
	}

	.slot.filled {
		background: rgba(95, 115, 255, 0.14);
		border: 2px solid var(--accent);
	}

	.slot.filled img {
		width: 72px;
		height: 72px;
		object-fit: contain;
	}

	.slot-name {
		font-weight: 700;
	}

	.slot-types,
	.mu-types,
	.matchup-best {
		display: flex;
		gap: 4px;
		align-items: center;
	}

	.pill {
		width: 22px;
		height: 22px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		font-size: 0.75rem;
	}

	.pool {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 10px;
	}

	.actions {
		display: flex;
		justify-content: center;
		margin-top: 6px;
	}

	.validate,
	.next {
		border: none;
		border-radius: 999px;
		padding: 12px 28px;
		font-size: 1rem;
		font-weight: 800;
		cursor: pointer;
		color: #fff;
		background: linear-gradient(135deg, #3d7bff, #5565ff);
		box-shadow: 0 8px 20px rgba(61, 123, 255, 0.35);
		transition: transform 0.12s ease, filter 0.12s ease;
	}

	.validate:hover:not(:disabled),
	.next:hover {
		transform: translateY(-2px);
		filter: brightness(1.08);
	}

	.validate:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: grid;
		place-items: center;
		padding: 16px;
		background: rgba(5, 5, 20, 0.7);
		backdrop-filter: blur(6px);
	}

	.modal {
		width: min(480px, 100%);
		background: var(--panel);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 18px;
		padding: 22px;
		display: grid;
		gap: 14px;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
	}

	.msg {
		margin: 0;
		text-align: center;
		font-size: 1.6rem;
		font-weight: 900;
	}

	.round-score {
		margin: 0;
		text-align: center;
		color: var(--muted);
	}

	.round-score .pos {
		color: var(--ok);
	}

	.round-score .neg {
		color: var(--ko);
	}

	.matchups {
		display: grid;
		gap: 10px;
	}

	.matchup {
		display: flex;
		align-items: center;
		gap: 10px;
		background: var(--panel-soft);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		padding: 8px 10px;
	}

	.matchup img {
		width: 48px;
		height: 48px;
		object-fit: contain;
	}

	.matchup-info {
		display: grid;
		gap: 4px;
		flex: 1;
	}

	.mu-name {
		font-weight: 700;
		font-size: 0.92rem;
	}

	.matchup-best {
		margin-left: auto;
	}

	.mult {
		font-weight: 800;
		font-size: 0.95rem;
	}

	.mult.good {
		color: var(--ok);
	}

	.mult.neutral {
		color: var(--muted);
	}

	.mult.bad {
		color: var(--ko);
	}

	@media (min-width: 640px) {
		.enemies,
		.selection {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
