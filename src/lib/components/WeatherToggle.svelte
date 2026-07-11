<script lang="ts">
	import { WEATHER_OPTIONS, type Weather } from '$lib/data/speedModifiers';

	interface Props {
		weather: Weather;
		onchange: (w: Weather) => void;
	}

	let { weather, onchange }: Props = $props();

	const TIP: Record<string, string> = {
		sun: 'Active Chlorophylle (x2)',
		rain: 'Active Tempo Rapide (x2)',
		sand: 'Active Ruée Sable (x2)',
		hail: 'Active Ruée Neige (x2)'
	};
</script>

<div class="weather">
	{#each WEATHER_OPTIONS as w (w.id)}
		<button
			type="button"
			class:active={weather === w.id}
			title={TIP[w.id]}
			onclick={() => onchange(weather === w.id ? null : w.id)}
		>
			{w.emoji} {w.label}
		</button>
	{/each}
</div>

<style>
	.weather {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		justify-content: center;
	}

	button {
		border: 2px solid rgba(255, 255, 255, 0.12);
		background: var(--panel-soft);
		color: var(--muted);
		font-weight: 700;
		font-size: 0.88rem;
		border-radius: 999px;
		padding: 7px 16px;
		cursor: pointer;
	}

	button:hover {
		color: var(--text);
	}

	button.active {
		color: #fff;
		border-color: #fff;
		background: linear-gradient(135deg, #3d7bff, #5565ff);
	}
</style>
