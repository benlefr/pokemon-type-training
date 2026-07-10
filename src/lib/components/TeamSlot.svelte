<script lang="ts">
	import type { Pokemon } from '$lib/data/roster';
	import { TYPE_INFO } from '$lib/data/typeNames';

	interface Props {
		pokemon: Pokemon | null;
		index: number;
		active?: boolean;
		onclick: () => void;
		onremove?: () => void;
	}

	let { pokemon, index, active = false, onclick, onremove }: Props = $props();
</script>

<div class="slot" class:filled={pokemon} class:active>
	{#if pokemon}
		<button type="button" class="remove" aria-label="Retirer" onclick={onremove}>×</button>
		<button type="button" class="body" onclick={onclick}>
			<img src={pokemon.thumbnail} alt={pokemon.name} loading="lazy" />
			<span class="name">{pokemon.nameFr}</span>
			<span class="types">
				{#each pokemon.types as t (t)}
					<span class="pill" style="background: {TYPE_INFO[t]?.color}">{TYPE_INFO[t]?.emoji}</span>
				{/each}
			</span>
		</button>
	{:else}
		<button type="button" class="body empty" onclick={onclick}>
			<span class="plus">+</span>
			<span class="lab">Slot {index + 1}</span>
		</button>
	{/if}
</div>

<style>
	.slot {
		position: relative;
		border-radius: 12px;
		min-height: 118px;
	}

	.body {
		width: 100%;
		height: 100%;
		min-height: 118px;
		border-radius: 12px;
		border: 2px solid rgba(255, 255, 255, 0.1);
		background: var(--panel-soft);
		color: inherit;
		cursor: pointer;
		display: grid;
		justify-items: center;
		align-content: center;
		gap: 3px;
		padding: 10px 6px;
		transition:
			transform 0.12s ease,
			border-color 0.12s ease,
			background 0.12s ease;
	}

	.body:hover {
		transform: translateY(-2px);
		border-color: var(--accent);
	}

	.body.empty {
		border-style: dashed;
		color: var(--muted);
	}

	.slot.active .body {
		border-color: var(--accent);
		background: rgba(95, 115, 255, 0.15);
	}

	.plus {
		font-size: 1.8rem;
		font-weight: 800;
		line-height: 1;
	}

	.lab {
		font-size: 0.8rem;
	}

	.body img {
		width: 60px;
		height: 60px;
		object-fit: contain;
	}

	.name {
		font-weight: 700;
		font-size: 0.82rem;
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

	.remove {
		position: absolute;
		top: 4px;
		right: 4px;
		z-index: 2;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		border: none;
		background: var(--ko);
		color: #fff;
		font-weight: 800;
		line-height: 1;
		cursor: pointer;
	}
</style>
