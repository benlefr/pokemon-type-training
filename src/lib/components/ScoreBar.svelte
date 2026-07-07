<script lang="ts">
	interface Props {
		score: number;
		total: number;
		streak?: number;
	}

	let { score, total, streak = 0 }: Props = $props();

	const pct = $derived(total > 0 ? Math.min(100, Math.round((score / total) * 100)) : 0);
</script>

<div class="score-bar">
	<div class="row">
		<span class="fraction">{score}<span class="slash">/</span>{total}</span>
		{#if streak > 0}
			<span class="streak" title="Série de bonnes réponses">🔥 {streak}</span>
		{/if}
	</div>
	<div class="track">
		<div class="fill" style="width: {pct}%"></div>
	</div>
</div>

<style>
	.score-bar {
		display: grid;
		gap: 6px;
		background: var(--panel-soft);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 14px;
		padding: 10px 14px;
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}

	.fraction {
		font-size: 1.35rem;
		font-weight: 800;
		letter-spacing: 0.4px;
	}

	.slash {
		opacity: 0.5;
		margin: 0 2px;
	}

	.streak {
		background: linear-gradient(135deg, #ff8a3d, #ff5d5d);
		border-radius: 999px;
		padding: 4px 10px;
		font-weight: 700;
		font-size: 0.9rem;
		box-shadow: 0 4px 10px rgba(255, 93, 93, 0.35);
	}

	.track {
		height: 8px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.1);
		overflow: hidden;
	}

	.fill {
		height: 100%;
		border-radius: 999px;
		background: linear-gradient(90deg, #22c55e, #4ade80);
		transition: width 0.4s ease;
	}
</style>
