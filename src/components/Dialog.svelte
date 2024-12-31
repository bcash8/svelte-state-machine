<script lang="ts">
	import { onMount } from 'svelte';

	let {
		onCancel,
		onConfirm,
		visible
	}: { onCancel: () => void; onConfirm: (input: string) => void; visible: boolean } = $props();
	let inputValue = $state('');
	let inputWarning = $state(false);
	function handleConfirm() {
		if (inputValue === '') {
			inputWarning = true;
		} else {
			onConfirm(inputValue);
			inputValue = '';
			inputWarning = false;
		}
	}

	$effect(() => {
		if (visible) {
			const inputElement = document.getElementById('dialog-input');
			inputElement?.focus();
		}
	});
</script>

{#if visible}
	<div
		class="frost"
		onclick={() => onCancel()}
		onkeyup={(event: KeyboardEvent) => {
			if (event.key === 'Escape') onCancel();
		}}
		role="button"
		tabindex="-1"
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions-->
		<div class="dialog" onclick={(e) => e.stopPropagation()}>
			<input
				class:warn={inputWarning}
				id="dialog-input"
				type="text"
				bind:value={inputValue}
				tabindex="0"
				onkeyup={(event: KeyboardEvent) => {
					if (event.key === 'Escape') onCancel();
					if (event.key === 'Enter') handleConfirm();
				}}
			/>
			<button onclick={handleConfirm}>Confirm</button>
		</div>
	</div>
{/if}

<style>
	.frost {
		width: 100%;
		height: 100%;
		background-color: #aaaaaa33;
		z-index: 999;
		position: fixed;
	}

	.dialog {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: 1em;
		background-color: #000;
		border-radius: 0.25rem;
		z-index: 1000;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}

	.dialog > input {
		background-color: #eee;
		color: black;
	}

	.dialog > input.warn {
		outline: 3px solid red;
	}

	.dialog > button {
		background-color: #eee;
		color: black;
		width: 100%;
		outline: 3px solid #00000000;

		transition: 0.2s ease-in-out;
	}

	.dialog > button:focus {
		outline: 3px solid white;
		background-color: var(--primary-color);
	}
</style>
