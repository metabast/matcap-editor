<script lang="ts">
    import { onMount } from 'svelte'; // eslint-disable-line
    import MatcapPreviewWorld from '../matcapPreview/MatcapPreviewWorld';
    import MatcapEditorWorld from '../matcapEditor/MatcapEditorWorld';
    import { matcapEditor } from '../store';

    // Force reload

    if (import.meta.hot) {
        import.meta.hot.dispose((data) => {
            import.meta.hot.invalidate();
        });
    }

    let exportDefault: number;
    matcapEditor.subscribe((value) => {
        exportDefault = value.sizes.exportDefault;
    });

    onMount(() => {
        const worldPreview = new MatcapPreviewWorld();
        worldPreview.init();
        const worldEditor = new MatcapEditorWorld();
        worldEditor.init();
    });
</script>

<canvas class="webgl" />
<canvas
    class="webgl2"
    width={String(exportDefault)}
    height={String(exportDefault)}
/>

<style>
    .webgl {
        outline: none;
        background-color: white;
    }
    .webgl2 {
        position: absolute;
        top: 0;
        right: 0;
        outline: none;
        background-color: black;
        width: 200px !important;
        height: 200px !important;
        border: 1px solid white;
    }
</style>
