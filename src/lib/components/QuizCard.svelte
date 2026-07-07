<script lang="ts">
	import { TYPE_INFO } from '$lib/data/typeNames';

	interface Props {
		/** un ou deux types cibles */
		types: string[];
		label?: string;
		hint?: string;
	}

	let { types, label = 'Type cible', hint = '' }: Props = $props();

	const infos = $derived(types.map((t) => TYPE_INFO[t]).filter(Boolean));
	const gradient = $derived(
		infos.length === 2
			? `linear-gradient(135deg, ${infos[0].color} 0%, ${infos[1].color} 100%)`
			: infos.length === 1
				? `linear-gradient(135deg, ${infos[0].color} 0%, ${infos[0].color}bb 100%)`
				: 'linear-gradient(135deg, #242557, #171836)'
	);
</script>

<section class="quiz-card" style="--card-bg: {gradient}">
	<p class="label">{label}</p>
	<div class="emojis">
		{#each infos as info, i (info.key)}
			{#if i > 0}<span class="sep">/</span>{/if}
			<span class="emoji">{info.emoji}</span>
		{/each}
	</div>
	<h2 class="fr">
		{infos.map((i) => i.fr).join(' / ')}
	</h2>
	<p class="en">{types.join(' / ')}</p>
	{#if hint}<p class="hint">{hint}</p>{/if}
</section>

<style>
	.quiz-card {
		position: relative;
		border-radius: 18px;
		padding: 22px 16px;
		text-align: center;
		display: grid;
		gap: 6px;
		justify-items: center;
		background: var(--card-bg);
		border: 1px solid rgba(255, 255, 255, 0.18);
		box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
		overflow: hidden;
	}

	.quiz-card::after {
		content: '';
		position: absolute;
		inset: 0;
		background: rgba(15, 15, 35, 0.28);
		pointer-events: none;
	}

	.quiz-card > * {
		position: relative;
		z-index: 1;
	}

	.label {
		margin: 0;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 1.5px;
		opacity: 0.9;
	}

	.emojis {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 60px;
		line-height: 1;
	}

	.sep {
		font-size: 34px;
		opacity: 0.7;
	}

	.fr {
		margin: 2px 0 0;
		font-size: 1.7rem;
		font-weight: 800;
		text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
	}

	.en {
		margin: 0;
		font-size: 0.95rem;
		opacity: 0.85;
	}

	.hint {
		margin: 6px 0 0;
		font-size: 0.9rem;
		opacity: 0.9;
		max-width: 32ch;
	}
</style>
