<script lang="ts">
	import type { Pokemon } from '$lib/data/roster';
	import { TYPE_INFO } from '$lib/data/typeNames';

	interface Props {
		pokemon: Pokemon;
		revealed: boolean;
		effectiveSpeed: number;
		modifiers: string[];
		isWinner: boolean;
		heldItemLabel?: string | null;
		onclick: () => void;
	}

	let {
		pokemon,
		revealed,
		effectiveSpeed,
		modifiers,
		isWinner,
		heldItemLabel = null,
		onclick
	}: Props = $props();

	function speedColor(s: number): string {
		if (s >= 120) return '#22c55e';
		if (s >= 90) return '#86c34a';
		if (s >= 60) return '#9aa0aa';
		return '#ef4444';
	}
</script>

<button
	type="button"
	class="card"
	class:revealed
	class:winner={revealed && isWinner}
	class:loser={revealed && !isWinner}
	disabled={revealed}
	onclick={onclick}
>
	<img src={pokemon.thumbnail} alt={pokemon.name} width="128" height="128" loading="lazy" />
	<span class="name">{pokemon.nameFr}</span>
	<span class="en">{pokemon.name}</span>
	<span class="types">
		{#each pokemon.types as t (t)}
			<span class="pill" style="background: {TYPE_INFO[t]?.color}">{TYPE_INFO[t]?.emoji} {t}</span>
		{/each}
	</span>

	{#if !revealed}
		{#if heldItemLabel}<span class="held">{heldItemLabel}</span>{/if}
		<span class="hidden-speed">???</span>
	{:else}
		<span class="speed" style="color: {speedColor(effectiveSpeed)}">{effectiveSpeed}</span>
		<span class="base">Base : {pokemon.base.Speed}</span>
		{#if modifiers.length > 0}
			<span class="mods">
				{#each modifiers as m (m)}<span class="mod">{m}</span>{/each}
			</span>
		{/if}
		{#if isWinner}<span class="badge">Plus rapide</span>{/if}
	{/if}
</button>

<style>
	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		min-height: 200px;
		padding: 18px 14px;
		border-radius: 18px;
		background: var(--panel-soft);
		border: 3px solid rgba(255, 255, 255, 0.1);
		color: var(--text);
		cursor: pointer;
		transition:
			transform 0.12s ease,
			border-color 0.12s ease;
	}

	.card:not(.revealed):hover {
		transform: translateY(-4px);
		border-color: var(--accent);
	}

	.card:disabled {
		cursor: default;
	}

	.card.winner {
		border-color: var(--ok);
	}

	.card.loser {
		border-color: var(--ko);
		opacity: 0.85;
	}

	img {
		image-rendering: pixelated;
	}

	.name {
		font-weight: 800;
		font-size: 1.05rem;
	}

	.en {
		color: var(--muted);
		font-size: 0.8rem;
		margin-top: -4px;
	}

	.types {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		justify-content: center;
	}

	.pill {
		font-size: 0.7rem;
		font-weight: 700;
		color: #fff;
		border-radius: 999px;
		padding: 2px 8px;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
	}

	.held {
		font-size: 0.8rem;
		font-weight: 600;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 8px;
		padding: 2px 8px;
	}

	.hidden-speed {
		margin-top: 2px;
		font-size: 2.4rem;
		font-weight: 900;
		color: var(--muted);
	}

	.speed {
		margin-top: 4px;
		font-size: 2.6rem;
		font-weight: 900;
		line-height: 1;
	}

	.base {
		color: var(--muted);
		font-size: 0.82rem;
	}

	.mods {
		display: flex;
		flex-direction: column;
		gap: 3px;
		align-items: center;
	}

	.mod {
		font-size: 0.78rem;
		font-weight: 600;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 8px;
		padding: 2px 8px;
	}

	.badge {
		margin-top: 4px;
		font-size: 0.75rem;
		font-weight: 800;
		color: #fff;
		background: var(--ok);
		border-radius: 999px;
		padding: 3px 12px;
	}
</style>
