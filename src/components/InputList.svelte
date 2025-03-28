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

	function removeInput(index: number) {
		const inputs = [...inputsToTest];
		inputs.splice(index, 1);
		setInputsToTest(inputs);
	}
</script>

<div class="panel column">
	<p>Input Strings</p>
	<ul>
		{#each inputsToTest as input, i}
			<li>
				<button onclick={() => removeInput(i)} class="input-string-button">{input}</button>
			</li>
		{/each}
	</ul>
	<div class="row">
		<input type="text" bind:value={inputBoxValue} placeholder="Add new input string" />
		<button onclick={onAddInput}><Plus /></button>
	</div>
</div>

<style>
	.panel {
		position: absolute;
		top: 60px;
		right: 10px;
		width: fit-content;
		background-color: var(--panel-color);
		color: white;
		border-radius: 0.25rem;
		overflow: hidden;
		z-index: 1;

		display: flex;
		align-items: center;
		justify-content: flex-start;
		padding: 0.5rem;
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
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
	}

	ul > li {
		width: 100%;
	}

	button {
		display: flex;
		justify-content: center;
		align-items: center;
		width: fit-content;
		background-color: #00000000;
		cursor: pointer;
		opacity: 0.7;
		transition: 0.2s ease-in-out;
		color: white;
	}

	.input-string-button {
		opacity: 1;
		width: 100%;
		text-align: left;
		background-color: #111;
	}

	.input-string-button:hover {
		background-color: black;
	}

	button:hover {
		opacity: 1;
	}

	input {
		color: white;
		background-color: black;
	}
</style>
