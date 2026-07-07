<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { roster } from '$lib/data/roster';

	let { children } = $props();

	const links = [
		{ href: '/', label: 'Accueil' },
		{ href: '/revision', label: 'Révision' },
		{ href: '/quiz', label: 'Quiz' }
	];

	function isActive(href: string, path: string): boolean {
		return href === '/' ? path === '/' : path.startsWith(href);
	}
</script>

<div class="shell">
	<header class="navbar">
		<a class="brand" href="/">
			<span class="ball" aria-hidden="true"></span>
			<span class="brand-text">Pokémon Type Training</span>
		</a>
		<nav>
			{#each links as link (link.href)}
				<a href={link.href} class:active={isActive(link.href, $page.url.pathname)}>
					{link.label}
				</a>
			{/each}
		</nav>
	</header>

	<main class="content">
		{@render children?.()}
	</main>

	<footer class="foot">
		Dataset VGC battle_data · {roster.length} Pokémon &amp; formes · 18 types · Table 18×18
	</footer>
</div>

<style>
	.shell {
		min-height: 100vh;
		display: grid;
		grid-template-rows: auto 1fr auto;
	}

	.navbar {
		position: sticky;
		top: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 16px;
		background: rgba(15, 15, 35, 0.8);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		flex-wrap: wrap;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: var(--text);
		font-weight: 800;
		font-size: 1.05rem;
	}

	.ball {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: linear-gradient(180deg, #ff5d5d 0 50%, #fff 50% 100%);
		border: 2px solid #0f0f23;
		box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
	}

	nav {
		display: flex;
		gap: 6px;
	}

	nav a {
		text-decoration: none;
		color: var(--muted);
		font-weight: 700;
		font-size: 0.92rem;
		padding: 7px 14px;
		border-radius: 999px;
		transition:
			background 0.15s ease,
			color 0.15s ease;
	}

	nav a:hover {
		color: var(--text);
		background: var(--panel-soft);
	}

	nav a.active {
		color: #fff;
		background: linear-gradient(135deg, #3d7bff, #5565ff);
	}

	.content {
		width: min(1100px, 100%);
		margin: 0 auto;
		padding: 18px 14px 32px;
	}

	.foot {
		text-align: center;
		color: var(--muted);
		font-size: 0.8rem;
		padding: 16px;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
	}

	@media (min-width: 860px) {
		.content {
			padding: 26px 24px 40px;
		}
	}
</style>
