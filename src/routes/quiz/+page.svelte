<script lang="ts">
	import ScoreBar from '$lib/components/ScoreBar.svelte';
	import DifficultyToggle from '$lib/components/DifficultyToggle.svelte';
	import QuizCard from '$lib/components/QuizCard.svelte';
	import DropZone from '$lib/components/DropZone.svelte';
	import TypeBadge from '$lib/components/TypeBadge.svelte';
	import { TYPES_SANS_STELLAR, TYPE_INFO, frName } from '$lib/data/typeNames';
	import {
		getWeakTo,
		getStrongAgainst,
		getWeakToDual,
		getStrongAgainstDual,
		getEffectiveness,
		getDualEffectiveness
	} from '$lib/data/typeChart';
	import { roster, type Pokemon } from '$lib/data/roster';

	type QuizMode = 'weakTo' | 'strongAgainst' | 'matchup' | 'pokemonQuiz';
	type Difficulty = 'single' | 'dual';

	const MODES: { id: QuizMode; label: string }[] = [
		{ id: 'weakTo', label: 'Qui le bat ?' },
		{ id: 'strongAgainst', label: "Qu'est-ce qu'il bat ?" },
		{ id: 'matchup', label: 'Matchup' },
		{ id: 'pokemonQuiz', label: 'Pokémon Champions' }
	];

	let quizMode = $state<QuizMode>('weakTo');
	let difficultyMode = $state<Difficulty>('single');

	let score = $state(0);
	let possible = $state(0);
	let streak = $state(0);

	// cible courante
	let target = $state<string[]>([]);
	let currentPokemon = $state<Pokemon | null>(null);

	// placements
	interface Placed {
		type: string;
		correct: boolean;
	}
	let placed = $state<Placed[]>([]);
	let selectedType = $state<string | null>(null);

	// matchup
	let matchAtk = $state('');
	let matchDef = $state('');
	let matchAnswer = $state<number | null>(null);

	let answered = $state(false);
	let roundScore = $state(0);
	let maxScore = $state(0);
	let showResult = $state(false);

	let lastKey = '';

	const isPlacement = $derived(
		quizMode === 'weakTo' || quizMode === 'strongAgainst' || quizMode === 'pokemonQuiz'
	);

	function rand<T>(arr: T[]): T {
		return arr[Math.floor(Math.random() * arr.length)];
	}

	function expectedSet(): Set<string> {
		if (quizMode === 'weakTo') {
			if (difficultyMode === 'dual' && target.length === 2) {
				return new Set(getWeakToDual(target[0], target[1]).map((m) => m.type));
			}
			return new Set(getWeakTo(target[0]));
		}
		if (quizMode === 'strongAgainst') {
			if (difficultyMode === 'dual' && target.length === 2) {
				return new Set(getStrongAgainstDual(target[0], target[1]).map((m) => m.type));
			}
			return new Set(getStrongAgainst(target[0]));
		}
		if (quizMode === 'pokemonQuiz' && currentPokemon) {
			const [t1, t2] = currentPokemon.types;
			return new Set(
				TYPES_SANS_STELLAR.filter((atk) => getDualEffectiveness(atk, t1, t2 ?? null) > 1)
			);
		}
		return new Set();
	}

	let expected = $state<Set<string>>(new Set());

	const availableTypes = $derived(
		TYPES_SANS_STELLAR.filter((t) => !placed.some((p) => p.type === t))
	);

	const questionLabel = $derived.by(() => {
		if (quizMode === 'weakTo') return 'Quels types sont super efficaces contre cette cible ?';
		if (quizMode === 'strongAgainst') return 'Quels types cette cible bat-elle ?';
		if (quizMode === 'pokemonQuiz') return 'Quels types sont super efficaces contre ce Pokémon ?';
		return 'Quel est le multiplicateur ?';
	});

	function pickTarget(): string[] {
		let next: string[];
		let key: string;
		let guard = 0;
		do {
			if (difficultyMode === 'dual') {
				const a = rand(TYPES_SANS_STELLAR);
				let b = rand(TYPES_SANS_STELLAR);
				while (b === a) b = rand(TYPES_SANS_STELLAR);
				next = [a, b];
			} else {
				next = [rand(TYPES_SANS_STELLAR)];
			}
			key = [...next].sort().join('+');
			guard++;
		} while (key === lastKey && guard < 10);
		lastKey = key;
		return next;
	}

	function startRound() {
		answered = false;
		showResult = false;
		placed = [];
		selectedType = null;
		matchAnswer = null;
		roundScore = 0;

		if (quizMode === 'matchup') {
			let atk = rand(TYPES_SANS_STELLAR);
			let def = rand(TYPES_SANS_STELLAR);
			let key = atk + '>' + def;
			let guard = 0;
			while (key === lastKey && guard < 10) {
				atk = rand(TYPES_SANS_STELLAR);
				def = rand(TYPES_SANS_STELLAR);
				key = atk + '>' + def;
				guard++;
			}
			lastKey = key;
			matchAtk = atk;
			matchDef = def;
			target = [];
			currentPokemon = null;
			expected = new Set();
			maxScore = 1;
			return;
		}

		if (quizMode === 'pokemonQuiz') {
			let p = rand(roster);
			let guard = 0;
			while (p.name === lastKey && guard < 10) {
				p = rand(roster);
				guard++;
			}
			lastKey = p.name;
			currentPokemon = p;
			target = p.types;
		} else {
			currentPokemon = null;
			target = pickTarget();
		}

		expected = expectedSet();
		maxScore = expected.size;
	}

	function placeType(type: string) {
		if (answered || placed.some((p) => p.type === type)) return;
		placed = [...placed, { type, correct: expected.has(type) }];
		selectedType = null;
	}

	function removeType(type: string) {
		if (answered) return;
		placed = placed.filter((p) => p.type !== type);
	}

	function onBadgeSelect(type: string) {
		selectedType = selectedType === type ? null : type;
	}

	function onZoneTap() {
		if (selectedType) placeType(selectedType);
	}

	function validate() {
		if (answered) return;
		answered = true;
		showResult = true;

		const correctPlaced = placed.filter((p) => p.correct).length;
		roundScore = correctPlaced;
		score += roundScore;
		possible += Math.max(maxScore, 1);

		if (maxScore > 0 && correctPlaced === maxScore && placed.length === maxScore) {
			streak += 1;
		} else {
			streak = 0;
		}
	}

	function answerMatchup(mult: number) {
		if (answered) return;
		answered = true;
		showResult = true;
		matchAnswer = mult;
		const correct = getEffectiveness(matchAtk, matchDef);
		if (mult === correct) {
			roundScore = 1;
			score += 1;
			streak += 1;
		} else {
			roundScore = 0;
			streak = 0;
		}
		maxScore = 1;
		possible += 1;
	}

	// éléments de résultat pour les modes placement
	const missed = $derived(
		isPlacement && answered
			? [...expected].filter((t) => !placed.some((p) => p.type === t))
			: []
	);
	const wrongPlaced = $derived(answered ? placed.filter((p) => !p.correct).map((p) => p.type) : []);

	const resultMessage = $derived.by(() => {
		if (quizMode === 'matchup') {
			return roundScore === 1 ? 'Correct !' : 'Raté !';
		}
		if (maxScore === 0) return roundScore === 0 && wrongPlaced.length === 0 ? 'Parfait !' : 'Continue !';
		const ratio = roundScore / maxScore;
		const perfect = roundScore === maxScore && wrongPlaced.length === 0;
		if (perfect) return 'Parfait !';
		if (ratio >= 0.75) return 'Excellent !';
		if (ratio >= 0.5) return 'Pas mal !';
		return 'Continue !';
	});

	const matchCorrect = $derived(getEffectiveness(matchAtk, matchDef));

	function placedResult(type: string): 'correct' | 'incorrect' {
		return expected.has(type) ? 'correct' : 'incorrect';
	}

	// (re)démarre quand le mode change
	function changeMode(m: QuizMode) {
		quizMode = m;
		startRound();
	}

	function onDifficultyChange() {
		startRound();
	}

	// init
	startRound();

	const MATCH_OPTIONS = [0, 0.5, 1, 2];
</script>

<h1 class="page-title">Quiz interactif</h1>

<div class="quiz-top">
	<ScoreBar {score} total={possible} {streak} />
</div>

<div class="mode-row">
	<DifficultyToggle
		bind:mode={difficultyMode}
		disabled={quizMode === 'pokemonQuiz' || quizMode === 'matchup' || (answered && placed.length > 0)}
		onchange={onDifficultyChange}
	/>
	<div class="mode-tabs">
		{#each MODES as m (m.id)}
			<button class:active={quizMode === m.id} onclick={() => changeMode(m.id)}>{m.label}</button>
		{/each}
	</div>
</div>

{#if quizMode === 'matchup'}
	<!-- Mode Matchup -->
	<section class="matchup">
		<div class="matchup-cards">
			<div class="mc">
				<span class="mc-label">Attaque</span>
				<span class="mc-emoji">{TYPE_INFO[matchAtk]?.emoji}</span>
				<span class="mc-name">{frName(matchAtk)}</span>
			</div>
			<span class="vs">➜</span>
			<div class="mc">
				<span class="mc-label">Défenseur</span>
				<span class="mc-emoji">{TYPE_INFO[matchDef]?.emoji}</span>
				<span class="mc-name">{frName(matchDef)}</span>
			</div>
		</div>

		<p class="q">{questionLabel}</p>

		<div class="match-options">
			{#each MATCH_OPTIONS as opt (opt)}
				<button
					class="match-btn"
					class:correct={answered && opt === matchCorrect}
					class:wrong={answered && matchAnswer === opt && opt !== matchCorrect}
					disabled={answered}
					onclick={() => answerMatchup(opt)}
				>
					x{opt}
				</button>
			{/each}
		</div>
	</section>
{:else}
	<!-- Modes placement -->
	<QuizCard
		types={quizMode === 'pokemonQuiz' && currentPokemon ? currentPokemon.types : target}
		label={quizMode === 'pokemonQuiz' && currentPokemon ? currentPokemon.nameFr : 'Type cible'}
		hint={questionLabel}
	/>

	<div class="answer-zone">
		<DropZone
			label={quizMode === 'strongAgainst' ? 'Types battus' : 'Types super efficaces'}
			subtitle="Glisse ou touche les types ici"
			items={placed.map((p) => ({ type: p.type, result: answered ? placedResult(p.type) : p.correct ? 'correct' : 'incorrect' }))}
			ondrop={placeType}
			onzonetap={onZoneTap}
			onremove={removeType}
			locked={answered}
			accent={TYPE_INFO[target[0]]?.color ?? '#5f73ff'}
		/>
	</div>

	<section class="pool">
		<h3>Types à placer</h3>
		<div class="pool-badges">
			{#each availableTypes as t (t)}
				<TypeBadge
					type={t}
					draggable
					selected={selectedType === t}
					onselect={onBadgeSelect}
				/>
			{/each}
			{#if availableTypes.length === 0}<span class="none">Tous les types sont placés.</span>{/if}
		</div>
		<p class="help">Sur mobile : touche un type puis touche la zone. Sur ordinateur : glisse-dépose.</p>
	</section>
{/if}

<div class="controls">
	{#if !answered}
		{#if isPlacement}
			<button class="action validate" onclick={validate} disabled={placed.length === 0}>Valider</button>
		{/if}
	{:else}
		<button class="action next" onclick={startRound}>
			{quizMode === 'pokemonQuiz' ? 'Pokémon suivant' : 'Suivant'}
		</button>
	{/if}
</div>

{#if showResult}
	<div class="overlay" role="dialog" aria-modal="true">
		<div class="result-card anim-fade-in">
			<h2 class="rmsg">{resultMessage}</h2>
			{#if quizMode === 'matchup'}
				<p class="rscore">
					{matchAnswer === matchCorrect ? 'Bonne réponse' : 'Mauvaise réponse'} :
					{frName(matchAtk)} ➜ {frName(matchDef)} = <b>x{matchCorrect}</b>
				</p>
			{:else}
				<p class="rscore">{roundScore}/{maxScore}</p>

				{#if wrongPlaced.length > 0}
					<div class="rsection">
						<h4>❌ Placés à tort</h4>
						<div class="badges">
							{#each wrongPlaced as w (w)}<TypeBadge type={w} size="sm" />{/each}
						</div>
					</div>
				{/if}

				{#if missed.length > 0}
					<div class="rsection">
						<h4>⚠️ Oubliés (bonnes réponses)</h4>
						<div class="badges">
							{#each missed as m (m)}<TypeBadge type={m} size="sm" />{/each}
						</div>
					</div>
				{/if}

				{#if wrongPlaced.length === 0 && missed.length === 0}
					<p class="perfect">Aucune erreur, bravo ! 🎉</p>
				{/if}
			{/if}

			<button class="action next" onclick={startRound}>
				{quizMode === 'pokemonQuiz' ? 'Pokémon suivant' : 'Type suivant'}
			</button>
		</div>
	</div>
{/if}

<style>
	.page-title {
		font-size: 1.8rem;
		font-weight: 900;
		margin: 0 0 16px;
	}

	.quiz-top {
		margin-bottom: 14px;
	}

	.mode-row {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16px;
	}

	.mode-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.mode-tabs button {
		border: 1px solid rgba(255, 255, 255, 0.15);
		background: var(--panel-soft);
		color: var(--muted);
		font-weight: 700;
		font-size: 0.85rem;
		padding: 7px 12px;
		border-radius: 999px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.mode-tabs button.active {
		background: linear-gradient(135deg, #a855f7, #6366f1);
		color: #fff;
		border-color: transparent;
	}

	.answer-zone {
		margin: 16px 0;
	}

	.pool {
		background: var(--panel-soft);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 14px;
		padding: 14px;
		display: grid;
		gap: 10px;
	}

	.pool h3 {
		margin: 0;
		font-size: 0.95rem;
		color: var(--muted);
	}

	.pool-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		min-height: 44px;
	}

	.help {
		margin: 0;
		color: var(--muted);
		font-size: 0.82rem;
	}

	.none {
		color: var(--muted);
	}

	.controls {
		display: flex;
		justify-content: center;
		gap: 12px;
		margin: 18px 0;
	}

	.action {
		border: none;
		border-radius: 12px;
		padding: 12px 26px;
		font-weight: 800;
		font-size: 1rem;
		cursor: pointer;
		color: #fff;
		transition:
			transform 0.12s ease,
			filter 0.12s ease;
	}

	.action:hover:not(:disabled) {
		transform: translateY(-1px);
		filter: brightness(1.06);
	}

	.action:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.validate {
		background: linear-gradient(135deg, #24a76f, #1cb663);
	}

	.next {
		background: linear-gradient(135deg, #3d7bff, #5565ff);
	}

	/* Matchup */
	.matchup {
		display: grid;
		gap: 18px;
		justify-items: center;
		background: var(--panel-soft);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 18px;
		padding: 24px 16px;
	}

	.matchup-cards {
		display: flex;
		align-items: center;
		gap: 18px;
	}

	.mc {
		display: grid;
		justify-items: center;
		gap: 2px;
		background: rgba(0, 0, 0, 0.25);
		border-radius: 14px;
		padding: 14px 20px;
		min-width: 110px;
	}

	.mc-label {
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 1px;
		color: var(--muted);
	}

	.mc-emoji {
		font-size: 46px;
	}

	.mc-name {
		font-weight: 800;
	}

	.vs {
		font-size: 28px;
		color: var(--muted);
	}

	.q {
		margin: 0;
		font-weight: 600;
		color: var(--muted);
	}

	.match-options {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 10px;
		width: 100%;
		max-width: 420px;
	}

	.match-btn {
		border: 1px solid rgba(255, 255, 255, 0.15);
		background: rgba(255, 255, 255, 0.06);
		color: #fff;
		font-weight: 800;
		font-size: 1.1rem;
		padding: 16px 0;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.12s ease;
	}

	.match-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.14);
		transform: translateY(-2px);
	}

	.match-btn.correct {
		background: var(--ok);
		border-color: #fff;
	}

	.match-btn.wrong {
		background: var(--ko);
		border-color: #fff;
	}

	/* Overlay résultat */
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(6, 6, 20, 0.7);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
		z-index: 100;
	}

	.result-card {
		background: linear-gradient(160deg, #20224d, #14152f);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 20px;
		padding: 24px;
		width: min(460px, 100%);
		display: grid;
		gap: 14px;
		text-align: center;
		box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
	}

	.rmsg {
		margin: 0;
		font-size: 1.7rem;
		font-weight: 900;
		background: linear-gradient(135deg, #7f9bff, #ff8ab0);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	.rscore {
		margin: 0;
		font-size: 1.2rem;
		font-weight: 700;
	}

	.rsection {
		text-align: left;
		background: rgba(0, 0, 0, 0.25);
		border-radius: 12px;
		padding: 10px 12px;
	}

	.rsection h4 {
		margin: 0 0 8px;
		font-size: 0.9rem;
	}

	.badges {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.perfect {
		margin: 0;
		font-weight: 700;
		color: var(--ok);
	}

	@media (min-width: 860px) {
		.answer-zone {
			max-width: 640px;
			margin-inline: auto;
		}
	}
</style>
