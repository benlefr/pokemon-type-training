<script lang="ts">
	import { TYPE_INFO } from '$lib/data/typeNames';

	interface Props {
		type: string;
		size?: 'sm' | 'md' | 'lg';
		placed?: boolean;
		result?: 'correct' | 'incorrect' | null;
		draggable?: boolean;
		selected?: boolean;
		showName?: boolean;
		onselect?: (type: string) => void;
		ondragstart?: (event: DragEvent, type: string) => void;
	}

	let {
		type,
		size = 'md',
		placed = false,
		result = null,
		draggable = false,
		selected = false,
		showName = true,
		onselect,
		ondragstart
	}: Props = $props();

	const info = $derived(TYPE_INFO[type]);

	const padding = $derived(
		size === 'sm' ? '4px 9px' : size === 'lg' ? '10px 16px' : '7px 12px'
	);
	const fontSize = $derived(size === 'sm' ? '0.78rem' : size === 'lg' ? '1.05rem' : '0.92rem');

	function handleClick() {
		if (placed) return;
		onselect?.(type);
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick();
		}
	}

	function handleDragStart(e: DragEvent) {
		if (placed) {
			e.preventDefault();
			return;
		}
		e.dataTransfer?.setData('text/plain', type);
		if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
		ondragstart?.(e, type);
	}
</script>

<button
	type="button"
	class="badge"
	class:placed
	class:selected
	class:correct={result === 'correct'}
	class:incorrect={result === 'incorrect'}
	class:anim-pulse-green={result === 'correct'}
	class:anim-shake-red={result === 'incorrect'}
	style="--type-color: {info?.color ?? '#374151'}; padding: {padding}; font-size: {fontSize};"
	draggable={draggable && !placed}
	tabindex={placed ? -1 : 0}
	aria-pressed={selected}
	aria-label={info?.fr ?? type}
	onclick={handleClick}
	onkeydown={handleKey}
	ondragstart={handleDragStart}
>
	<span class="emoji">{info?.emoji ?? '❓'}</span>
	{#if showName}<span class="name">{info?.fr ?? type}</span>{/if}
</button>

<style>
	.badge {
		border: 2px solid transparent;
		color: #fff;
		font-weight: 700;
		border-radius: 999px;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		cursor: pointer;
		user-select: none;
		white-space: nowrap;
		background: var(--type-color);
		box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.22);
		transition:
			transform 0.12s ease,
			filter 0.12s ease,
			outline-color 0.15s ease;
		outline: 2px solid transparent;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
	}

	.badge:hover:not(.placed) {
		transform: translateY(-1px);
		filter: brightness(1.08);
	}

	.badge:active:not(.placed) {
		transform: scale(0.97);
	}

	.badge:focus-visible {
		outline-color: #fff;
	}

	.badge.selected {
		outline-color: #fff;
		box-shadow: 0 0 0 3px rgba(95, 115, 255, 0.7);
	}

	.badge.placed {
		cursor: default;
	}

	.badge.correct {
		border-color: rgba(255, 255, 255, 0.85);
	}

	.badge.incorrect {
		border-color: rgba(255, 255, 255, 0.85);
		filter: grayscale(0.35) brightness(0.8);
	}

	.emoji {
		line-height: 1;
	}
</style>
