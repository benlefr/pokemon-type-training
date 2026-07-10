<script lang="ts">
	import type { Pokemon } from '$lib/data/roster';
	import { TYPE_INFO, TYPES_SANS_STELLAR } from '$lib/data/typeNames';
	import {
		getEffectiveness,
		pokemonDefMultiplier,
		teamOffensiveCoverage,
		teamDefensiveWeakness
	} from '$lib/data/typeChart';

	interface Props {
		team: Pokemon[];
		roster: Pokemon[];
		onselect: (p: Pokemon) => void;
	}

	let { team, roster, onselect }: Props = $props();

	interface Suggestion {
		pokemon: Pokemon;
		covers: string[];
		resists: string[];
		score: number;
	}

	const suggestions = $derived.by<Suggestion[]>(() => {
		if (team.length === 0) return [];

		const offense = teamOffensiveCoverage(team);
		const defense = teamDefensiveWeakness(team);

		const uncovered = TYPES_SANS_STELLAR.filter((t) => (offense.get(t) ?? 0) < 2);
		const threats = TYPES_SANS_STELLAR.filter((t) => (defense.get(t) ?? 1) >= 2);

		const inTeam = new Set(team.map((p) => p.name));

		return roster
			.filter((p) => !inTeam.has(p.name))
			.map((p): Suggestion => {
				const covers = uncovered.filter(
					(t) => Math.max(...p.types.map((at) => getEffectiveness(at, t))) >= 2
				);
				const resists = threats.filter((t) => pokemonDefMultiplier(p, t) < 1);
				return { pokemon: p, covers, resists, score: covers.length * 2 + resists.length };
			})
			.filter((s) => s.score > 0)
			.sort((a, b) => b.score - a.score)
			.slice(0, 12);
	});
</script>

{#if team.length === 0}
	<p class="hint">Ajoutez des Pokémon pour obtenir des suggestions.</p>
{:else if suggestions.length === 0}
	<p class="hint">Aucune suggestion : votre couverture est déjà solide.</p>
{:else}
	<div class="grid">
		{#each suggestions as s (s.pokemon.name)}
			<div class="card">
				<img src={s.pokemon.thumbnail} alt={s.pokemon.name} loading="lazy" />
				<span class="name">{s.pokemon.nameFr}</span>
				<span class="types">
					{#each s.pokemon.types as t (t)}
						<span class="pill" style="background: {TYPE_INFO[t]?.color}">{TYPE_INFO[t]?.emoji}</span>
					{/each}
				</span>
				{#if s.covers.length > 0}
					<span class="tag covers">
						Couvre : {s.covers.map((t) => TYPE_INFO[t]?.emoji).join(' ')}
					</span>
				{/if}
				{#if s.resists.length > 0}
					<span class="tag resists">
						Résiste : {s.resists.map((t) => TYPE_INFO[t]?.emoji).join(' ')}
					</span>
				{/if}
				<button type="button" class="add" onclick={() => onselect(s.pokemon)}>Ajouter</button>
			</div>
		{/each}
	</div>
{/if}

<style>
	.hint {
		margin: 0;
		color: var(--muted);
		font-size: 0.9rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 10px;
	}

	.card {
		background: var(--panel-soft);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 10px 8px;
		display: grid;
		justify-items: center;
		gap: 4px;
	}

	.card img {
		width: 60px;
		height: 60px;
		object-fit: contain;
	}

	.name {
		font-weight: 700;
		font-size: 0.85rem;
		text-align: center;
	}

	.types {
		display: flex;
		gap: 4px;
	}

	.pill {
		width: 20px;
		height: 20px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		font-size: 0.72rem;
	}

	.tag {
		font-size: 0.72rem;
		border-radius: 6px;
		padding: 2px 6px;
		text-align: center;
	}

	.covers {
		background: rgba(34, 197, 94, 0.18);
		color: #86efac;
	}

	.resists {
		background: rgba(6, 182, 212, 0.18);
		color: #67e8f9;
	}

	.add {
		margin-top: 2px;
		border: none;
		border-radius: 999px;
		padding: 6px 14px;
		font-weight: 700;
		font-size: 0.8rem;
		cursor: pointer;
		color: #fff;
		background: linear-gradient(135deg, #3d7bff, #5565ff);
	}

	.add:hover {
		filter: brightness(1.08);
	}
</style>
