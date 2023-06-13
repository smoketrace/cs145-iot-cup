import { writable } from 'svelte/store';

export const visibleStore = writable(false);

export function openModal() {
    visibleStore.set(true);
  }

export function closeModal() {
    visibleStore.set(false);
  }
