<script lang="ts">
	import { base } from '$app/paths';
	import { roster } from '$lib/data/roster';
	import { TYPES_SANS_STELLAR } from '$lib/data/typeNames';

	const stats = [
		{ value: roster.length, label: 'Pokémon' },
		{ value: TYPES_SANS_STELLAR.length, label: 'Types' },
		{ value: TYPES_SANS_STELLAR.length * TYPES_SANS_STELLAR.length, label: 'Matchups' }
	];
</script>

<section class="hero anim-fade-in">
	<h1>Pokémon Type Training</h1>
	<p class="subtitle">Apprends les types Pokémon avec le roster VGC ({roster.length} Pokémon &amp; formes)</p>

	<div class="cards">
		<a class="card revision" href={`${base}/revision`}>
			<span class="ico">📚</span>
			<span class="card-title">Feuilles de révision</span>
			<span class="card-desc">Table 18×18, fiches par type, calculateur dual et roster complet.</span>
		</a>
		<a class="card quiz" href={`${base}/quiz`}>
			<span class="ico">🎮</span>
			<span class="card-title">Quiz interactif</span>
			<span class="card-desc">Glisse-dépose les types, mode single/dual, 4 modes de jeu.</span>
		</a>
		<a class="card double" href={`${base}/double-battle`}>
			<span class="ico">⚔️</span>
			<span class="card-title">Double Battle</span>
			<span class="card-desc">Choisis 2 Pokémon pour contrer une équipe adverse.</span>
		</a>
		<a class="card team" href={`${base}/team-builder`}>
			<span class="ico">🏗️</span>
			<span class="card-title">Team Builder</span>
			<span class="card-desc">Construis ton équipe et analyse la couverture de types.</span>
		</a>
	</div>

	<div class="stats">
		{#each stats as s (s.label)}
			<div class="stat">
				<span class="num">{s.value}</span>
				<span class="lab">{s.label}</span>
			</div>
		{/each}
	</div>
</section>

<style>
	.hero {
		text-align: center;
		display: grid;
		gap: 20px;
		padding: 24px 0 8px;
	}

	h1 {
		margin: 0;
		font-size: clamp(2rem, 6vw, 3.2rem);
		font-weight: 900;
		background: linear-gradient(135deg, #7f9bff, #ff8ab0);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	.subtitle {
		margin: 0;
		color: var(--muted);
		font-size: 1.05rem;
	}

	.cards {
		display: grid;
		gap: 16px;
		grid-template-columns: 1fr;
		margin-top: 8px;
	}

	.card {
		text-decoration: none;
		color: var(--text);
		border-radius: 18px;
		padding: 24px 20px;
		display: grid;
		gap: 8px;
		justify-items: center;
		border: 1px solid rgba(255, 255, 255, 0.12);
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	.card:hover {
		transform: translateY(-4px);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
	}

	.revision {
		background: linear-gradient(145deg, #23315f, #1a2145);
	}

	.quiz {
		background: linear-gradient(145deg, #3a2260, #241640);
	}

	.double {
		background: linear-gradient(145deg, #5f2330, #3a1622);
	}

	.team {
		background: linear-gradient(145deg, #234f3a, #1a3528);
	}

	.ico {
		font-size: 44px;
	}

	.card-title {
		font-size: 1.3rem;
		font-weight: 800;
	}

	.card-desc {
		color: var(--muted);
		font-size: 0.92rem;
		max-width: 34ch;
	}

	.stats {
		display: flex;
		justify-content: center;
		gap: 12px;
		flex-wrap: wrap;
		margin-top: 8px;
	}

	.stat {
		background: var(--panel-soft);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 14px;
		padding: 14px 22px;
		display: grid;
		justify-items: center;
		min-width: 110px;
	}

	.num {
		font-size: 1.8rem;
		font-weight: 900;
		color: #7f9bff;
	}

	.lab {
		color: var(--muted);
		font-size: 0.85rem;
	}

	@media (min-width: 760px) {
		.cards {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
