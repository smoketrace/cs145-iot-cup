<script>
	import './styles.css';

	import Sidebar from './Sidebar.svelte';
	
	let sidebarOpen = false;
</script>

<div class="app">
	<Sidebar bind:sidebarOpen/>

	<main>
		<slot />
	</main>

</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	/* @media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	} */
</style>
