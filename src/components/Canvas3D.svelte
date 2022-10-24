<script lang="ts">
    import { onMount } from 'svelte'; // eslint-disable-line
    import { MatcapEditorStore } from '../store';
    import type { IMatcapEditorStore } from '../store';
    import MatcapLights from './MatcapLights.svelte';
    import PreviewProperties from './PreviewProperties.svelte';
    import CanvasSnapshots from './CanvasSnapshots.svelte';
    import Editor from 'src/Editor';

    // Force reload

    if (import.meta.hot) {
        import.meta.hot.dispose(() => {
            import.meta.hot.invalidate();
        });
    }

    let store: IMatcapEditorStore;
    MatcapEditorStore.subscribe((value) => {
        store = value;
    });

    onMount(() => {
        new Editor();
    });

    $: getStyles = () => `
            width: ${store.sizes.view}px!important;
            height: ${store.sizes.view}px!important;
        `;
</script>

<CanvasSnapshots />
<canvas class="webgl" />
<canvas class="webgl2" width={String(store.sizes.view)} height={String(store.sizes.view)} style={getStyles()} />
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
        border: 1px solid white;
    }
</style>
