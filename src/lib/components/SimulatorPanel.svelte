<script lang="ts">
	import type { Pokemon } from '$lib/data/roster';
	import { TYPE_INFO } from '$lib/data/typeNames';
	import { getBestOffensiveMultiplier, pokemonDefMultiplier } from '$lib/data/typeChart';

	interface Props {
		team: Pokemon[];
		roster: Pokemon[];
	}

	let { team, roster }: Props = $props();

	let enemyTeam = $state<Pokemon[]>([]);

	interface Matchup {
		mine: Pokemon;
		enemy: Pokemon;
		mult: number;
	}

	function pickRandom(n: number, exclude: Set<string>): Pokemon[] {
		const pouch = roster.filter((p) => !exclude.has(p.name));
		const out: Pokemon[] = [];
		while (out.length < n && pouch.length > 0) {
			const i = Math.floor(Math.random() * pouch.length);
			out.push(pouch.splice(i, 1)[0]);
		}
		return out;
	}

	function generateEnemyTeam() {
		enemyTeam = pickRandom(6, new Set(team.map((p) => p.name)));
	}

	const matchups = $derived.by<Matchup[]>(() => {
		if (team.length === 0 || enemyTeam.length === 0) return [];
		return enemyTeam.map((enemy) => {
			let best: Pokemon = team[0];
			let mult = -1;
			for (const mine of team) {
				const m = getBestOffensiveMultiplier(mine.types, enemy.types[0], enemy.types[1] ?? null);
				if (m > mult) {
					mult = m;
					best = mine;
				}
			}
			return { mine: best, enemy, mult };
		});
	});

	const winChance = $derived.by(() => {
		if (matchups.length === 0) return 0;
		const favorable = matchups.filter((m) => m.mult >= 2).length;
		let base = (favorable / matchups.length) * 100;

		let penalty = 0;
		for (const enemy of enemyTeam) {
			for (const at of enemy.types) {
				const canHurt = team.every((mine) => pokemonDefMultiplier(mine, at) >= 2);
				if (canHurt) penalty += 4;
			}
		}
		return Math.max(0, Math.min(100, Math.round(base - penalty)));
	});

	function multIcon(m: number): string {
		if (m >= 2) return '✓';
		if (m >= 1) return '~';
		return '✗';
	}

	function multClass(m: number): 'good' | 'neutral' | 'bad' {
		if (m >= 2) return 'good';
		if (m >= 1) return 'neutral';
		return 'bad';
	}

	function multLabel(m: number): string {
		if (m === 0) return 'x0';
		if (m === 0.25) return '¼';
		if (m === 0.5) return '½';
		return `x${m}`;
	}
</script>

<div class="sim">
	{#if team.length === 0}
		<p class="hint">Ajoutez des Pokémon à votre équipe pour lancer un combat.</p>
	{:else}
		<div class="controls">
			<button type="button" class="btn" onclick={generateEnemyTeam}>
				{enemyTeam.length === 0 ? 'Générer une équipe adverse' : 'Autre équipe'}
			</button>
		</div>

		{#if enemyTeam.length > 0}
			<div class="teams">
				<div class="side">
					<h4>Votre équipe</h4>
					<div class="mons">
						{#each team as p (p.name)}
							<img src={p.thumbnail} alt={p.name} title={p.nameFr} />
						{/each}
					</div>
				</div>
				<div class="side">
					<h4 class="enemy">Adversaire</h4>
					<div class="mons">
						{#each enemyTeam as p (p.name)}
							<img src={p.thumbnail} alt={p.name} title={p.nameFr} />
						{/each}
					</div>
				</div>
			</div>

			<div class="bar-wrap">
				<div class="bar-label">Chance de victoire : <strong>{winChance}%</strong></div>
				<div class="track"><div class="fill" style="width: {winChance}%"></div></div>
			</div>

			<div class="matchups">
				{#each matchups as m (m.enemy.name)}
					<div class="row">
						<img class="thumb" src={m.enemy.thumbnail} alt={m.enemy.name} />
						<span class="rname">{m.enemy.nameFr}</span>
						<span class="types">
							{#each m.enemy.types as t (t)}
								<span class="pill" style="background: {TYPE_INFO[t]?.color}">{TYPE_INFO[t]?.emoji}</span>
							{/each}
						</span>
						<span class="arrow">←</span>
						<img class="thumb" src={m.mine.thumbnail} alt={m.mine.name} title={m.mine.nameFr} />
						<span class="verdict {multClass(m.mult)}">{multIcon(m.mult)} {multLabel(m.mult)}</span>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	.sim {
		display: grid;
		gap: 12px;
	}

	.hint {
		margin: 0;
		color: var(--muted);
		font-size: 0.9rem;
	}

	.controls {
		display: flex;
		gap: 10px;
	}

	.btn {
		border: none;
		border-radius: 999px;
		padding: 10px 20px;
		font-weight: 800;
		cursor: pointer;
		color: #fff;
		background: linear-gradient(135deg, #3d7bff, #5565ff);
	}

	.btn:hover {
		filter: brightness(1.08);
	}

	.teams {
		display: grid;
		grid-template-columns: 1fr;
		gap: 10px;
	}

	.side h4 {
		margin: 0 0 6px;
		font-size: 0.9rem;
	}

	.side h4.enemy {
		color: #ff9a8a;
	}

	.mons {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.mons img {
		width: 44px;
		height: 44px;
		object-fit: contain;
		background: var(--panel-soft);
		border-radius: 8px;
	}

	.bar-wrap {
		display: grid;
		gap: 6px;
	}

	.bar-label {
		font-size: 0.92rem;
	}

	.track {
		height: 12px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.1);
		overflow: hidden;
	}

	.fill {
		height: 100%;
		border-radius: 999px;
		background: linear-gradient(90deg, #ef4444, #f59e0b 50%, #22c55e);
		transition: width 0.4s ease;
	}

	.matchups {
		display: grid;
		gap: 6px;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 8px;
		background: var(--panel-soft);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 10px;
		padding: 6px 8px;
	}

	.thumb {
		width: 36px;
		height: 36px;
		object-fit: contain;
	}

	.rname {
		font-weight: 700;
		font-size: 0.85rem;
	}

	.types {
		display: flex;
		gap: 3px;
	}

	.pill {
		width: 18px;
		height: 18px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		font-size: 0.68rem;
	}

	.arrow {
		color: var(--muted);
	}

	.verdict {
		margin-left: auto;
		font-weight: 800;
		font-size: 0.9rem;
		white-space: nowrap;
	}

	.verdict.good {
		color: var(--ok);
	}

	.verdict.neutral {
		color: var(--muted);
	}

	.verdict.bad {
		color: var(--ko);
	}

	@media (min-width: 640px) {
		.teams {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
