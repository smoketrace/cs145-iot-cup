<script lang="ts">
    import Fa from 'svelte-fa/src/fa.svelte';
    import { faFire } from '@fortawesome/free-solid-svg-icons'

    export let showFireAlert: boolean;
	let dialog: HTMLDialogElement

	$: if (showFireAlert && dialog) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog
	bind:this={dialog}
	on:close={() => dialog.close()}
    on:click|self={() => dialog.close()}
>
    <h1><Fa icon={faFire} /> FIRE WARNING</h1>
    <p>Sensors have been detecting high smoke levels for five minutes.</p>
    <div class="contactNos">
        <strong>Emergency numbers:</strong>
        <li>
            <strong>Quezon City Fire District: </strong><span>8330-2344</span>
        </li>
    </div>
    <button on:click={() => dialog.close()}>X</button>
</dialog>

<style>
	dialog {
        color: var(--smoketrace-black);
		max-width: 32rem;
		border-radius: 0.75rem;
		border: none;
		padding: 2.5rem;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

    h1 {
        margin-top: 0;
        color: var(--fire-orange);
    }

    button {
        right: 2%;
        top: 4%;
        position: absolute;
    }

    li {
        list-style-type: disclosure-closed;
    }

    .contactNos {
        font-size: larger;
    }
</style>
