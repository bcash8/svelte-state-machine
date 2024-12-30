<script lang="ts">
	import IconContext from 'phosphor-svelte/lib/IconContext';
	import '../app.css';
	let { children } = $props();
</script>

<IconContext values={{ size: 32, color: 'white', weight: 'bold' }}>
	{@render children()}
</IconContext>
