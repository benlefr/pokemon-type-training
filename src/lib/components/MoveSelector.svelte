<script lang="ts">
	import type { Pokemon } from '$lib/data/roster';
	import { TYPE_INFO, frName } from '$lib/data/typeNames';

	interface Props {
		pokemon: Pokemon;
		selected: string[];
		ontoggle: (move: string) => void;
	}

	let { pokemon, selected, ontoggle }: Props = $props();

	const moves = $derived(pokemon.moves ?? []);

	function catIcon(c: string): string {
		if (c === 'Physical') return '💥';
		if (c === 'Special') return '🌀';
		return '🛡️';
	}
</script>

<div class="move-selector">
	<p class="head">
		Attaques de {pokemon.nameFr} — {selected.length}/4
	</p>
	{#if moves.length === 0}
		<p class="empty">Aucune donnée d'attaque pour ce Pokémon.</p>
	{:else}
		<div class="list">
			{#each moves as m (m.name)}
				{@const isSel = selected.includes(m.name)}
				<button
					type="button"
					class="move"
					class:selected={isSel}
					style="--type-color: {TYPE_INFO[m.type]?.color ?? '#555'}"
					disabled={!isSel && selected.length >= 4}
					onclick={() => ontoggle(m.name)}
				>
					<span class="cat">{catIcon(m.category)}</span>
					<span class="mname">{m.name}</span>
					<span class="mtype" style="background: {TYPE_INFO[m.type]?.color}">
						{TYPE_INFO[m.type]?.emoji} {frName(m.type)}
					</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.move-selector {
		display: grid;
		gap: 10px;
	}

	.head {
		margin: 0;
		font-weight: 700;
		font-size: 0.9rem;
	}

	.empty {
		margin: 0;
		color: var(--muted);
		font-size: 0.85rem;
	}

	.list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 8px;
	}

	.move {
		display: flex;
		align-items: center;
		gap: 8px;
		background: var(--panel-soft);
		border: 2px solid rgba(255, 255, 255, 0.1);
		border-radius: 10px;
		padding: 8px 10px;
		cursor: pointer;
		color: inherit;
		text-align: left;
	}

	.move:hover:not(:disabled) {
		border-color: var(--type-color);
	}

	.move.selected {
		border-color: var(--type-color);
		background: color-mix(in srgb, var(--type-color) 22%, transparent);
	}

	.move:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.cat {
		font-size: 0.9rem;
	}

	.mname {
		font-weight: 700;
		font-size: 0.85rem;
		flex: 1;
	}

	.mtype {
		font-size: 0.7rem;
		font-weight: 700;
		color: #fff;
		border-radius: 999px;
		padding: 2px 8px;
		white-space: nowrap;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
	}
</style>
