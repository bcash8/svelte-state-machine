<script lang="ts">
	let { onChange }: { onChange: (value: number) => void } = $props();
  function handleChange(e: Event) {
    const target = e.target;
    if (!target || !(target instanceof HTMLInputElement)) return;
    onChange(target.valueAsNumber)
  }
</script>

<div class="slider-container">
	<input
		type="range"
		min="1"
		max="100"
		value="50"
		class="slider"
		onchange={handleChange}
	/>
</div>

<style>
	.slider-container {
		width: 100%;
	}

	.slider {
		appearance: none;
		width: 100%;
		height: 25px;
		background-color: #000;
		outline: none;
		opacity: 0.7;
		transition: 0.2s ease-in-out;
	}

	.slider:hover {
		opacity: 1;
	}

	.slider::-webkit-slider-thumb {
		appearance: none;
		width: 25px;
		height: 25px;
		border-radius: 0.25rem;
		background: white;
		cursor: pointer;
	}
</style>
