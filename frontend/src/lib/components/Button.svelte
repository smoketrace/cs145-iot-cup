<script lang="ts">
    export let type = 'button' as 'button' | 'reset' | 'submit';
    export let variant = 'primary';
    export let disabled = false;
</script>

<button {type} {disabled} class={variant} on:click>
    <slot />
</button>

<style>
    button {
        background-color: transparent;
        border: none;
        border-radius: 0.25rem;
        color: var(--smoketrace-white);
        cursor: pointer;
        font-family: inherit;
        padding: 0.5rem 1rem 0.5rem;
        filter: brightness(1);
        transition:
            filter 0.3s,
            color 0.3s;
    }

    button:active {
        box-shadow: inset 0.125rem 0.125rem rgba(0, 0, 0, 0.4);
    }

    button:disabled:not([hover]) {
        opacity: 40%;
    }

    .primary {
        background-color: var(--fire-orange);
    }

    .primary:hover {
        filter: brightness(1.10);
    }

    .secondary:hover {
        color: darkgrey;
    }
</style>
