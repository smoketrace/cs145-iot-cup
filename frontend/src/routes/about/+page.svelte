<script>
	import textlogo from '$lib/images/SmokeTrace_Logo_Text.svg';

	import Fa from 'svelte-fa/src/fa.svelte';
    import { faGithub } from '@fortawesome/free-brands-svg-icons'
</script>

<svelte:head>
	<title>About</title>
	<meta name="description" content="About" />
</svelte:head>

<div>
<h1>About</h1>

		<span class="textlogodisp">
			<picture>
				<source srcset={textlogo} type="image/svg" />
				<img src={textlogo} alt="SmokeTrace text logo" />
			</picture>
		</span>
		<h2>The smart smoke alarm for your home.</h2>
		<p>Powered by ESP-32 microcontrollers and hosted seamlessly on the cloud, SmokeTrace is the cutting-edge IoT solution to protecting your home against fire accidents.</p>
		<p><Fa icon={faGithub} /> See the source code <a href="https://github.com/smoketrace/cs145-iot-cup">here</a>.</p>
</div>

<style>
	.textlogodisp {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.textlogodisp img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}

	p {
		color: var(--smoke-beige);
		font-family: "Roboto";
	}

	h2 {
		text-align: center;
		font-size: 1.75rem;
	}

	a {
		color: var(--fire-orange);
	}
</style>
