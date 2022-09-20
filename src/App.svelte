<script lang="ts">
    import EngineCanvas from './components/Canvas3D.svelte';
</script>

<main>
    <EngineCanvas />
</main>

<style>
    :root {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    :global(body) {
        margin: 0;
        padding: 0;
        overflow: hidden;
    }
</style>
