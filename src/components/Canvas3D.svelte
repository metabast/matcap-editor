<script lang="ts">
    import { onMount } from 'svelte'; // eslint-disable-line
    import MatcapPreviewWorld from '../matcapPreview/MatcapPreviewWorld';
    import MatcapEditorWorld from '../matcapEditor/MatcapEditorWorld';
    import { MatcapEditorStore } from '../store';
    import type { IMatcapEditorStore } from '../store';
    import MatcapLights from './MatcapLights.svelte';
    import PreviewProperties from './PreviewProperties.svelte';
    import CanvasSnapshots from './CanvasSnapshots.svelte';

    // Force reload

    if (import.meta.hot) {
        import.meta.hot.dispose((data) => {
            import.meta.hot.invalidate();
        });
    }

    let store: IMatcapEditorStore;
    MatcapEditorStore.subscribe((value) => {
        store = value;
    });

    onMount(() => {
        const worldPreview = new MatcapPreviewWorld();
        worldPreview.init();
        const worldEditor = new MatcapEditorWorld();
        worldEditor.init();
    });
</script>

<CanvasSnapshots />
<canvas class="webgl" />
<canvas
    class="webgl2"
    width={String(store.sizes.exportDefault)}
    height={String(store.sizes.exportDefault)}
/>
<MatcapLights />

<PreviewProperties />

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
