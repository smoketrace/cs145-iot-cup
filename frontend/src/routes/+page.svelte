<script>
	import textlogo from '$lib/images/SmokeTrace_Logo_Text.svg';
</script>

<svelte:head>
	<title>Dashboard</title>
	<meta name="description" content="SmokeTrace webapp dashboard" />
</svelte:head>

<section>
		<span class="frontpage"> 
			<picture>
				<source srcset={textlogo} type="image/svg" />
				<img src={textlogo} alt="SmokeTrace text logo" />
			</picture>
		</span>
		<p>
			A smart smoke detection and fire alarm system for the home, built out of ESP32 microcontrollers and hosted on the cloud.
		</p>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	p {
		color: var(--smoke-beige);
		font-style: italic;
	}

	.frontpage {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.frontpage img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
