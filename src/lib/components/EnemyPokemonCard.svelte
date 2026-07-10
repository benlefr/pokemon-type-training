<script lang="ts">
	import type { Pokemon } from '$lib/data/roster';
	import TypeBadge from './TypeBadge.svelte';

	interface Props {
		pokemon: Pokemon;
		difficulty: 'single' | 'dual';
	}

	let { pokemon, difficulty }: Props = $props();

	const shownTypes = $derived(
		difficulty === 'single' ? pokemon.types.slice(0, 1) : pokemon.types
	);
</script>

<section class="enemy-card">
	<span class="tag">ADVERSE</span>
	{#if pokemon.thumbnail}
		<img src={pokemon.thumbnail} alt={pokemon.name} loading="lazy" />
	{/if}
	<h3 class="fr">{pokemon.nameFr}</h3>
	<p class="en">{pokemon.name}</p>
	<div class="types">
		{#each shownTypes as t (t)}
			<TypeBadge type={t} size="sm" placed />
		{/each}
	</div>
</section>

<style>
	.enemy-card {
		position: relative;
		border-radius: 16px;
		padding: 18px 14px 14px;
		display: grid;
		justify-items: center;
		gap: 6px;
		background: linear-gradient(160deg, rgba(239, 68, 68, 0.18), rgba(255, 138, 61, 0.1));
		border: 1px solid rgba(239, 68, 68, 0.4);
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
	}

	.tag {
		position: absolute;
		top: 8px;
		left: 8px;
		background: var(--ko);
		color: #fff;
		font-size: 0.68rem;
		font-weight: 800;
		letter-spacing: 1px;
		padding: 3px 8px;
		border-radius: 999px;
	}

	.enemy-card img {
		width: 96px;
		height: 96px;
		object-fit: contain;
	}

	.fr {
		margin: 4px 0 0;
		font-size: 1.15rem;
		font-weight: 800;
	}

	.en {
		margin: 0;
		color: var(--muted);
		font-size: 0.8rem;
	}

	.types {
		display: flex;
		gap: 6px;
		margin-top: 4px;
	}
</style>
