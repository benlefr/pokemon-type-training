<script lang="ts">
	import type { Pokemon } from '$lib/data/roster';
	import { TYPE_INFO } from '$lib/data/typeNames';

	interface Props {
		roster: Pokemon[];
		onselect?: (p: Pokemon) => void;
		limit?: number;
	}

	let { roster, onselect, limit = 60 }: Props = $props();

	let query = $state('');
	let typeFilter = $state('');
	let formFilter = $state('');

	const forms = $derived([...new Set(roster.map((p) => p.form))]);
	const typesInRoster = $derived(
		[...new Set(roster.flatMap((p) => p.types))].sort((a, b) => a.localeCompare(b))
	);

	const filtered = $derived(
		roster.filter((p) => {
			const q = query.trim().toLowerCase();
			const matchQuery =
				!q || p.name.toLowerCase().includes(q) || p.nameFr.toLowerCase().includes(q);
			const matchType = !typeFilter || p.types.includes(typeFilter);
			const matchForm = !formFilter || p.form === formFilter;
			return matchQuery && matchType && matchForm;
		})
	);

	const shown = $derived(filtered.slice(0, limit));
</script>

<div class="selector">
	<div class="filters">
		<input class="search" type="search" placeholder="Rechercher un Pokémon…" bind:value={query} />
		<select bind:value={typeFilter}>
			<option value="">Tous les types</option>
			{#each typesInRoster as t (t)}
				<option value={t}>{TYPE_INFO[t]?.emoji} {TYPE_INFO[t]?.fr ?? t}</option>
			{/each}
		</select>
		{#if forms.length > 1}
			<select bind:value={formFilter}>
				<option value="">Toutes formes</option>
				{#each forms as f (f)}
					<option value={f}>{f}</option>
				{/each}
			</select>
		{/if}
	</div>

	<p class="count">{filtered.length} Pokémon{#if filtered.length > limit}&nbsp;(affichés : {limit}){/if}</p>

	<div class="grid">
		{#each shown as p (p.name)}
			<button class="poke" onclick={() => onselect?.(p)}>
				{#if p.thumbnail}
					<img src={p.thumbnail} alt={p.name} loading="lazy" />
				{/if}
				<span class="name">{p.nameFr}</span>
				<span class="dex">#{p.dexNumber}</span>
				<span class="types">
					{#each p.types as t (t)}
						<span class="pill" style="background: {TYPE_INFO[t]?.color}">
							{TYPE_INFO[t]?.emoji}
						</span>
					{/each}
				</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.selector {
		display: grid;
		gap: 12px;
	}

	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.search,
	select {
		background: var(--panel-soft);
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: var(--text);
		border-radius: 10px;
		padding: 9px 12px;
		font-size: 0.9rem;
	}

	.search {
		flex: 1 1 200px;
	}

	select option {
		background: #1a1b36;
	}

	.count {
		margin: 0;
		color: var(--muted);
		font-size: 0.85rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 10px;
	}

	.poke {
		background: var(--panel-soft);
		border: 1px solid rgba(255, 255, 255, 0.1);
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

	.poke:hover {
		transform: translateY(-2px);
		border-color: var(--accent);
		background: rgba(95, 115, 255, 0.12);
	}

	.poke img {
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
