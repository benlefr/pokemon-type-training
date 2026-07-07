<script lang="ts">
	import { TYPE_INFO, TYPES_SANS_STELLAR, TYPE_KEYS } from '$lib/data/typeNames';
	import { getEffectiveness } from '$lib/data/typeChart';

	interface Props {
		includeStellar?: boolean;
	}

	let { includeStellar = false }: Props = $props();

	let view = $state<'offensive' | 'defensive'>('offensive');
	let hideNeutral = $state(false);

	const types = $derived(includeStellar ? TYPE_KEYS : TYPES_SANS_STELLAR);

	interface Selection {
		atk: string;
		def: string;
		mult: number;
	}
	let selected = $state<Selection | null>(null);

	// En vue offensive : ligne = attaquant, colonne = défenseur.
	// En vue défensive : ligne = défenseur, colonne = attaquant.
	function cellValue(row: string, col: string): number {
		return view === 'offensive' ? getEffectiveness(row, col) : getEffectiveness(col, row);
	}

	function cellColor(mult: number): string {
		if (mult === 0) return '#7f1d1d';
		if (mult < 1) return '#b45309';
		if (mult > 1) return '#15803d';
		return '#374151';
	}

	function label(mult: number): string {
		if (mult === 0) return '0';
		if (mult === 0.5) return '½';
		if (mult === 2) return '2';
		return '1';
	}

	function selectCell(row: string, col: string) {
		const mult = cellValue(row, col);
		const atk = view === 'offensive' ? row : col;
		const def = view === 'offensive' ? col : row;
		selected = { atk, def, mult };
	}

	const rowHeader = $derived(view === 'offensive' ? 'ATT \\ DEF' : 'DEF \\ ATT');

	function explanation(s: Selection): string {
		const atk = TYPE_INFO[s.atk]?.fr ?? s.atk;
		const def = TYPE_INFO[s.def]?.fr ?? s.def;
		if (s.mult === 0) return `${atk} n'affecte pas ${def} (x0, immunité).`;
		if (s.mult === 0.5) return `${atk} n'est pas très efficace contre ${def} (x0.5).`;
		if (s.mult === 2) return `${atk} est super efficace contre ${def} (x2).`;
		return `${atk} inflige des dégâts normaux à ${def} (x1).`;
	}
</script>

<div class="chart-wrap">
	<div class="controls">
		<div class="seg">
			<button class:active={view === 'offensive'} onclick={() => (view = 'offensive')}>
				Vue offensive
			</button>
			<button class:active={view === 'defensive'} onclick={() => (view = 'defensive')}>
				Vue défensive
			</button>
		</div>
		<label class="check">
			<input type="checkbox" bind:checked={hideNeutral} />
			Masquer les neutres (x1)
		</label>
	</div>

	{#if selected}
		<p class="explain anim-fade-in">{explanation(selected)}</p>
	{:else}
		<p class="explain muted">Touche une cellule pour voir le détail du matchup.</p>
	{/if}

	<div class="scroll">
		<table>
			<thead>
				<tr>
					<th class="corner">{rowHeader}</th>
					{#each types as col (col)}
						<th class="col-head" title={TYPE_INFO[col]?.fr}>
							<span>{TYPE_INFO[col]?.emoji}</span>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each types as row (row)}
					<tr>
						<th class="row-head" style="--c: {TYPE_INFO[row]?.color}">
							<span class="dot"></span>
							{TYPE_INFO[row]?.fr}
						</th>
						{#each types as col (col)}
							{@const mult = cellValue(row, col)}
							<td>
								{#if hideNeutral && mult === 1}
									<span class="cell empty"></span>
								{:else}
									<button
										class="cell"
										style="background: {cellColor(mult)}"
										class:sel={selected?.atk === (view === 'offensive' ? row : col) &&
											selected?.def === (view === 'offensive' ? col : row)}
										onclick={() => selectCell(row, col)}
										title="{TYPE_INFO[row]?.fr} / {TYPE_INFO[col]?.fr} : x{mult}"
									>
										{label(mult)}
									</button>
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.chart-wrap {
		display: grid;
		gap: 12px;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
	}

	.seg {
		display: inline-flex;
		background: var(--panel-soft);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 999px;
		padding: 4px;
		gap: 4px;
	}

	.seg button {
		border: none;
		background: transparent;
		color: var(--muted);
		font-weight: 700;
		font-size: 0.85rem;
		padding: 6px 12px;
		border-radius: 999px;
		cursor: pointer;
	}

	.seg button.active {
		background: linear-gradient(135deg, #3d7bff, #5565ff);
		color: #fff;
	}

	.check {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 0.88rem;
		color: var(--muted);
		cursor: pointer;
	}

	.check input {
		accent-color: var(--accent);
		transform: scale(1.15);
	}

	.explain {
		margin: 0;
		font-weight: 600;
		min-height: 1.3em;
	}

	.explain.muted {
		color: var(--muted);
		font-weight: 500;
	}

	.scroll {
		overflow: auto;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		max-height: 70vh;
	}

	table {
		border-collapse: separate;
		border-spacing: 2px;
		background: rgba(0, 0, 0, 0.2);
	}

	th,
	td {
		padding: 0;
	}

	.corner {
		position: sticky;
		top: 0;
		left: 0;
		z-index: 3;
		background: #12132b;
		font-size: 0.62rem;
		color: var(--muted);
		padding: 4px 6px;
		white-space: nowrap;
	}

	.col-head {
		position: sticky;
		top: 0;
		z-index: 2;
		background: #12132b;
		font-size: 1rem;
		width: 30px;
		height: 30px;
		text-align: center;
	}

	.row-head {
		position: sticky;
		left: 0;
		z-index: 1;
		background: #12132b;
		font-size: 0.72rem;
		font-weight: 700;
		text-align: left;
		padding: 4px 8px 4px 6px;
		white-space: nowrap;
	}

	.row-head .dot {
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--c);
		margin-right: 5px;
		vertical-align: middle;
	}

	.cell {
		display: block;
		width: 30px;
		height: 30px;
		border: none;
		color: #fff;
		font-weight: 700;
		font-size: 0.78rem;
		cursor: pointer;
		border-radius: 4px;
		transition:
			transform 0.1s ease,
			outline-color 0.1s ease;
		outline: 2px solid transparent;
	}

	.cell:hover {
		transform: scale(1.12);
		z-index: 5;
		position: relative;
	}

	.cell.sel {
		outline-color: #fff;
	}

	.cell.empty {
		background: transparent !important;
		cursor: default;
	}
</style>
