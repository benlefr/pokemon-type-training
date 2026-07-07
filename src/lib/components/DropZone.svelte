<script lang="ts">
	import TypeBadge from './TypeBadge.svelte';

	interface PlacedItem {
		type: string;
		result?: 'correct' | 'incorrect' | null;
	}

	interface Props {
		label: string;
		subtitle?: string;
		items?: PlacedItem[];
		/** appelé quand un type est déposé (drag) ou placé (tap) */
		ondrop?: (type: string) => void;
		/** appelé quand la zone est activée en mode tap */
		onzonetap?: () => void;
		/** appelé au clic sur un badge déjà placé */
		onremove?: (type: string) => void;
		locked?: boolean;
		accent?: string;
	}

	let {
		label,
		subtitle = '',
		items = [],
		ondrop,
		onzonetap,
		onremove,
		locked = false,
		accent = '#5f73ff'
	}: Props = $props();

	let active = $state(false);

	function handleDragOver(e: DragEvent) {
		if (locked) return;
		e.preventDefault();
		active = true;
	}

	function handleDrop(e: DragEvent) {
		if (locked) return;
		e.preventDefault();
		active = false;
		const type = e.dataTransfer?.getData('text/plain');
		if (type) ondrop?.(type);
	}

	function handleClick() {
		if (locked) return;
		onzonetap?.();
	}
</script>

<button
	type="button"
	class="drop-zone"
	class:active
	style="--accent: {accent}"
	ondragover={handleDragOver}
	ondragleave={() => (active = false)}
	ondrop={handleDrop}
	onclick={handleClick}
	aria-label={label}
>
	<span class="head">
		<span class="title">{label}</span>
		{#if subtitle}<span class="subtitle">{subtitle}</span>{/if}
	</span>

	<span class="content">
		{#each items as item (item.type)}
			<TypeBadge
				type={item.type}
				placed
				result={item.result}
				onselect={() => onremove?.(item.type)}
			/>
		{/each}
		{#if items.length === 0}
			<span class="empty">Dépose les types ici</span>
		{/if}
	</span>
</button>

<style>
	.drop-zone {
		display: grid;
		grid-template-rows: auto 1fr;
		gap: 10px;
		width: 100%;
		text-align: left;
		background: rgba(255, 255, 255, 0.03);
		border: 2px dashed rgba(255, 255, 255, 0.25);
		border-radius: 14px;
		min-height: 130px;
		padding: 12px;
		cursor: pointer;
		color: inherit;
		transition:
			border-color 0.15s ease,
			background 0.15s ease,
			transform 0.15s ease;
	}

	.drop-zone.active {
		border-color: var(--accent);
		border-style: solid;
		background: rgba(95, 115, 255, 0.15);
		transform: translateY(-2px);
	}

	.head {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.title {
		font-size: 1.05rem;
		font-weight: 800;
	}

	.subtitle {
		color: var(--muted);
		font-size: 0.82rem;
		font-weight: 500;
	}

	.content {
		display: flex;
		flex-wrap: wrap;
		align-content: flex-start;
		gap: 8px;
	}

	.empty {
		color: var(--muted);
		font-size: 0.85rem;
		opacity: 0.7;
		align-self: center;
	}

	@media (min-width: 860px) {
		.drop-zone {
			min-height: 220px;
		}
	}
</style>
