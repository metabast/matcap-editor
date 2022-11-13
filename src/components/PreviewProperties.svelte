<script lang="ts">
    import PreviewMaterialPaneFolder from 'src/matcapPreview/panes/PreviewMaterialFolder';
    import { PreviewStore, type IPreviewStore } from 'src/store';
    import { onMount } from 'svelte';
    import { Pane } from 'tweakpane';

    if (import.meta.hot) {
        import.meta.hot.dispose(() => {
            import.meta.hot.invalidate();
        });
    }

    let store: IPreviewStore;
    PreviewStore.subscribe((newStore) => {
        store = newStore;
    });

    let pane: Pane;
    onMount(() => {
        pane = new Pane({
            container: document.querySelector('.matcap-preview-pane'),
            title: 'Preview',
        });

        PreviewMaterialPaneFolder.initialize(pane);

        pane.addInput(store, 'showGrid').on('change', () => {
            PreviewStore.set(store);
        });
    });
</script>

<div class="matcap-preview-pane" />

<style>
    .matcap-preview-pane {
        position: fixed;
        left: 0px;
        top: 50px;
        z-index: 1;
        user-select: none;
    }
</style>
