<script lang="ts">
	import './styles.css';

	import Sidebar from './Sidebar.svelte';
    import FireAlert from '$lib/components/FireAlert.svelte';

	import { visibleStore } from '$lib/helpers/showAlert';

	let sidebarOpen = false;
	let showFireAlert: boolean;
	$: showFireAlert = $visibleStore;

</script>

<div class="app">
	<Sidebar bind:sidebarOpen />
	<FireAlert bind:showFireAlert/>

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
