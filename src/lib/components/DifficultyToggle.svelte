<script lang="ts">
	interface Props {
		mode: 'single' | 'dual';
		disabled?: boolean;
		onchange?: (mode: 'single' | 'dual') => void;
	}

	let { mode = $bindable('single'), disabled = false, onchange }: Props = $props();

	function set(next: 'single' | 'dual') {
		if (disabled || next === mode) return;
		mode = next;
		onchange?.(next);
	}
</script>

<div class="toggle" class:disabled role="group" aria-label="Difficulté">
	<button type="button" class:active={mode === 'single'} onclick={() => set('single')} {disabled}>
		Single Type
	</button>
	<button type="button" class:active={mode === 'dual'} onclick={() => set('dual')} {disabled}>
		Dual Type
	</button>
</div>

<style>
	.toggle {
		display: inline-flex;
		background: var(--panel-soft);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 999px;
		padding: 4px;
		gap: 4px;
	}

	.toggle.disabled {
		opacity: 0.55;
	}

	button {
		border: none;
		background: transparent;
		color: var(--muted);
		font-weight: 700;
		font-size: 0.9rem;
		padding: 7px 14px;
		border-radius: 999px;
		cursor: pointer;
		transition:
			background 0.15s ease,
			color 0.15s ease;
	}

	button:disabled {
		cursor: not-allowed;
	}

	button.active {
		background: linear-gradient(135deg, #3d7bff, #5565ff);
		color: #fff;
		box-shadow: 0 4px 10px rgba(61, 123, 255, 0.35);
	}
</style>
