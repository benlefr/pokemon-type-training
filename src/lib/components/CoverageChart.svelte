<script lang="ts">
	import type { Pokemon } from '$lib/data/roster';
	import { TYPE_INFO, TYPES_SANS_STELLAR } from '$lib/data/typeNames';
	import { teamOffensiveCoverage, teamDefensiveWeakness } from '$lib/data/typeChart';

	interface Props {
		team: Pokemon[];
		mode: 'offensive' | 'defensive';
	}

	let { team, mode }: Props = $props();

	const data = $derived(
		mode === 'offensive' ? teamOffensiveCoverage(team) : teamDefensiveWeakness(team)
	);

	const cells = $derived(
		TYPES_SANS_STELLAR.map((t) => ({ type: t, mult: data.get(t) ?? 1 }))
	);

	function offColor(m: number): string {
		if (m >= 4) return '#15803d';
		if (m >= 2) return '#22c55e';
		if (m === 1) return 'rgba(255,255,255,0.12)';
		if (m > 0) return '#f59e0b';
		return '#ef4444';
	}

	function defColor(m: number): string {
		if (m >= 4) return '#dc2626';
		if (m >= 2) return '#ef4444';
		if (m === 1) return 'rgba(255,255,255,0.12)';
		if (m > 0) return '#06b6d4';
		return '#3b82f6';
	}

	function label(m: number): string {
		if (m === 0) return 'x0';
		if (m === 0.25) return '¼';
		if (m === 0.5) return '½';
		return `x${m}`;
	}

	const covered = $derived(cells.filter((c) => c.mult >= 2).length);
</script>

<div class="chart">
	<p class="summary">
		{#if mode === 'offensive'}
			Vous couvrez <strong>{covered}/18</strong> types en x2+
		{:else}
			<strong>{covered}/18</strong> types vous frappent en x2+ (meilleur résisteur)
		{/if}
	</p>
	<div class="grid">
		{#each cells as c (c.type)}
			<div
				class="cell"
				style="background: {mode === 'offensive' ? offColor(c.mult) : defColor(c.mult)}"
				title="{TYPE_INFO[c.type]?.fr}: {label(c.mult)}"
			>
				<span class="emoji">{TYPE_INFO[c.type]?.emoji}</span>
				<span class="mult">{label(c.mult)}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.chart {
		display: grid;
		gap: 10px;
	}

	.summary {
		margin: 0;
		color: var(--muted);
		font-size: 0.9rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
		gap: 6px;
	}

	.cell {
		border-radius: 8px;
		padding: 6px 4px;
		display: grid;
		justify-items: center;
		gap: 2px;
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.emoji {
		font-size: 1rem;
		line-height: 1;
	}

	.mult {
		font-size: 0.72rem;
		font-weight: 700;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}
</style>
