<script lang="ts">
	import type { Pokemon } from '$lib/data/roster';
	import { TYPE_INFO } from '$lib/data/typeNames';

	interface Props {
		pokemon: Pokemon;
		selected: boolean;
		disabled: boolean;
		onclick: () => void;
	}

	let { pokemon, selected, disabled, onclick }: Props = $props();
</script>

<button
	type="button"
	class="pool-card"
	class:selected
	{disabled}
	aria-pressed={selected}
	{onclick}
>
	{#if pokemon.thumbnail}
		<img src={pokemon.thumbnail} alt={pokemon.name} loading="lazy" />
	{/if}
	<span class="name">{pokemon.nameFr}</span>
	<span class="dex">#{pokemon.dexNumber}</span>
	<span class="types">
		{#each pokemon.types as t (t)}
			<span class="pill" style="background: {TYPE_INFO[t]?.color}">
				{TYPE_INFO[t]?.emoji}
			</span>
		{/each}
	</span>
</button>

<style>
	.pool-card {
		background: var(--panel-soft);
		border: 2px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 10px 8px;
		display: grid;
		justify-items: center;
		gap: 2px;
		cursor: pointer;
		color: inherit;
		transition:
			transform 0.12s ease,
			border-color 0.12s ease,
			background 0.12s ease;
	}

	.pool-card:hover:not(:disabled) {
		transform: translateY(-2px);
		border-color: var(--accent);
		background: rgba(95, 115, 255, 0.12);
	}

	.pool-card:active:not(:disabled) {
		transform: scale(0.96);
	}

	.pool-card.selected {
		border-color: var(--accent);
		background: rgba(95, 115, 255, 0.2);
		box-shadow: 0 0 0 2px rgba(95, 115, 255, 0.5);
	}

	.pool-card:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.pool-card img {
		width: 64px;
		height: 64px;
		object-fit: contain;
	}

	.name {
		font-weight: 700;
		font-size: 0.9rem;
		text-align: center;
	}

	.dex {
		color: var(--muted);
		font-size: 0.72rem;
	}

	.types {
		display: flex;
		gap: 4px;
		margin-top: 2px;
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
</style>
