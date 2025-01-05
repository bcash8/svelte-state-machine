<script lang="ts">
	import Plus from 'phosphor-svelte/lib/Plus';
	let {
		inputsToTest,
		setInputsToTest
	}: { inputsToTest: string[]; setInputsToTest: (inputs: string[]) => void } = $props();

	let inputBoxValue = $state('');
	function onAddInput() {
		setInputsToTest([...inputsToTest, inputBoxValue]);
		inputBoxValue = '';
	}
</script>

<div class="panel column">
	<div class="row">
		<input type="text" bind:value={inputBoxValue} />
		<button onclick={onAddInput}><Plus /></button>
	</div>
	<ul>
		{#each inputsToTest as input}
			<li>{input}</li>
		{/each}
	</ul>
</div>

<style>
	.panel {
		position: absolute;
		top: 60px;
		right: 10px;
		width: fit-content;
		background-color: #0000005b;
		color: white;
		border-radius: 0.25rem;
		overflow: hidden;
		z-index: 1;

		display: flex;
		align-items: center;
		justify-content: flex-start;
		padding: 0 0.25rem;
	}

	.column {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	ul {
		width: 100%;
	}

	button {
		display: flex;
		justify-content: center;
		align-items: center;
		width: fit-content;
		padding: 0.5rem;
		aspect-ratio: 1 / 1;
		background-color: #00000000;
		cursor: pointer;
		opacity: 0.7;
		transition: 0.2s ease-in-out;
	}

	button:hover {
		opacity: 1;
	}

	input {
		color: white;
		background-color: black;
	}
</style>
