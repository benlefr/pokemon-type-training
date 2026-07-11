<script lang="ts">
	import { roster, type Pokemon } from '$lib/data/roster';
	import {
		getEffectiveSpeed,
		randomItem,
		type Difficulty,
		type SpeedItem,
		type Weather
	} from '$lib/data/speedModifiers';
	import SpeedComparisonCard from '$lib/components/SpeedComparisonCard.svelte';
	import WeatherToggle from '$lib/components/WeatherToggle.svelte';

	const DIFFICULTIES: { id: Difficulty; label: string }[] = [
		{ id: 'easy', label: 'Facile' },
		{ id: 'medium', label: 'Moyen' },
		{ id: 'hard', label: 'Difficile' },
		{ id: 'expert', label: 'Expert' }
	];
	const WEATHERS: Weather[] = ['sun', 'rain', 'sand', 'hail'];

	let difficulty = $state<Difficulty>('easy');
	let weather = $state<Weather>('sun');
	let pair = $state<[Pokemon, Pokemon]>([roster[0], roster[1]]);
	let items = $state<[SpeedItem | null, SpeedItem | null]>([null, null]);
	let answered = $state(false);
	let playerChoice = $state<number | null>(null);
	let score = $state(0);
	let total = $state(0);
	let streak = $state(0);

	const eff = $derived(
		pair.map((p, i) => getEffectiveSpeed(p, difficulty, weather, items[i])) as [
			{ speed: number; modifiers: string[] },
			{ speed: number; modifiers: string[] }
		]
	);
	const heldLabels = $derived(
		items.map((it) => (difficulty === 'medium' && it ? `${it.emoji} ${it.nameFr}` : null))
	);
	const winnerIndex = $derived(eff[0].speed >= eff[1].speed ? 0 : 1);
	const isTie = $derived(eff[0].speed === eff[1].speed);
	const correct = $derived(answered && playerChoice === winnerIndex);

	const streakMsg = $derived(
		streak >= 5 ? 'En feu ! 🔥' : streak >= 3 ? 'Super streak !' : total > 0 && streak === 0 ? 'Streak perdu' : ''
	);

	function twoRandom(): [Pokemon, Pokemon] {
		const a = Math.floor(Math.random() * roster.length);
		let b = Math.floor(Math.random() * roster.length);
		while (roster[b].name === roster[a].name) b = Math.floor(Math.random() * roster.length);
		return [roster[a], roster[b]];
	}

	function startRound() {
		pair = twoRandom();
		items = difficulty === 'easy' ? [null, null] : [randomItem(), randomItem()];
		if (difficulty === 'hard') weather = WEATHERS[Math.floor(Math.random() * WEATHERS.length)];
		answered = false;
		playerChoice = null;
	}

	function choosePokemon(index: number) {
		if (answered) return;
		playerChoice = index;
		answered = true;
		total++;
		if (index === winnerIndex) {
			score++;
			streak++;
		} else {
			streak = 0;
		}
	}

	function setDifficulty(d: Difficulty) {
		if (d === difficulty) return;
		difficulty = d;
		score = 0;
		total = 0;
		streak = 0;
		startRound();
	}

	startRound();
</script>

<section class="page">
	<h1 class="page-title">⚡ Speed Tier Quiz</h1>
	<p class="subtitle">Clique sur le Pokémon le plus rapide.</p>

	<div class="scorebar">
		<span><b>{score}</b> / {total}</span>
		<span class="streak">🔥 {streak}</span>
		{#if streakMsg}<span class="streak-msg">{streakMsg}</span>{/if}
	</div>

	<div class="diff">
		{#each DIFFICULTIES as d (d.id)}
			<button class:active={difficulty === d.id} onclick={() => setDifficulty(d.id)}>{d.label}</button>
		{/each}
	</div>

	{#if difficulty === 'expert'}
		<div class="weather-box">
			<WeatherToggle {weather} onchange={(w) => (weather = w)} />
		</div>
	{/if}

	<div class="arena">
		<SpeedComparisonCard
			pokemon={pair[0]}
			revealed={answered}
			effectiveSpeed={eff[0].speed}
			modifiers={eff[0].modifiers}
			isWinner={winnerIndex === 0}
			heldItemLabel={heldLabels[0]}
			onclick={() => choosePokemon(0)}
		/>
		<span class="vs">VS</span>
		<SpeedComparisonCard
			pokemon={pair[1]}
			revealed={answered}
			effectiveSpeed={eff[1].speed}
			modifiers={eff[1].modifiers}
			isWinner={winnerIndex === 1}
			heldItemLabel={heldLabels[1]}
			onclick={() => choosePokemon(1)}
		/>
	</div>

	{#if answered}
		<div class="result" class:ok={correct} class:ko={!correct}>
			<p class="verdict">{correct ? 'Plus rapide ! ✓' : 'Moins rapide ! ✗'}</p>
			<p class="detail">
				{pair[0].nameFr} ({eff[0].speed}) {isTie ? '=' : winnerIndex === 0 ? '>' : '<'}
				{pair[1].nameFr} ({eff[1].speed})
			</p>
			<button class="next" onclick={startRound}>Suivant →</button>
		</div>
	{/if}
</section>

<style>
	.page {
		display: grid;
		gap: 16px;
		justify-items: center;
	}

	.page-title {
		font-size: 1.8rem;
		font-weight: 900;
		margin: 0;
	}

	.subtitle {
		margin: -8px 0 0;
		color: var(--muted);
	}

	.scorebar {
		display: flex;
		align-items: center;
		gap: 16px;
		font-size: 1.05rem;
	}

	.streak {
		color: #ff9f43;
		font-weight: 700;
	}

	.streak-msg {
		font-weight: 700;
		color: var(--accent);
	}

	.diff,
	.weather-box {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		justify-content: center;
	}

	.diff button {
		border: 2px solid rgba(255, 255, 255, 0.12);
		background: var(--panel-soft);
		color: var(--muted);
		font-weight: 700;
		border-radius: 999px;
		padding: 7px 16px;
		cursor: pointer;
	}

	.diff button:hover {
		color: var(--text);
	}

	.diff button.active {
		color: #fff;
		border-color: #fff;
		background: linear-gradient(135deg, #3d7bff, #5565ff);
	}

	.arena {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 14px;
		width: 100%;
		max-width: 640px;
	}

	.vs {
		font-weight: 900;
		font-size: 1.3rem;
		color: var(--muted);
	}

	.result {
		display: grid;
		gap: 8px;
		justify-items: center;
		background: var(--panel-soft);
		border: 2px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: 16px 20px;
		width: min(100%, 640px);
	}

	.result.ok {
		border-color: var(--ok);
	}

	.result.ko {
		border-color: var(--ko);
	}

	.verdict {
		margin: 0;
		font-size: 1.2rem;
		font-weight: 800;
	}

	.detail {
		margin: 0;
		color: var(--muted);
	}

	.next {
		border: none;
		border-radius: 999px;
		padding: 9px 22px;
		font-weight: 800;
		color: #fff;
		background: linear-gradient(135deg, #3d7bff, #5565ff);
		cursor: pointer;
	}

	@media (max-width: 640px) {
		.arena {
			grid-template-columns: 1fr;
		}

		.vs {
			transform: rotate(90deg);
		}
	}
</style>
