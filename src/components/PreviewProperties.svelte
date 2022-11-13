<script lang="ts">
    import { PreviewStore, type IPreviewStore } from 'src/store';
    import { onMount } from 'svelte';
    import { Pane } from 'tweakpane';
    import events from '../commons/Events';

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

        pane.addInput(store, 'power', {
            min: 0,
            max: 10,
            step: 0.01,
        }).on('change', () => {
            events.emit('object:power:update');
        });

        pane.addInput(store, 'roughness', {
            min: 0,
            max: 1,
            step: 0.01,
        }).on('change', (event) => {
            store.metalness = 1 - event.value;
            events.emit('object:roughness:update');
            pane.refresh();
        });

        pane.addInput(store, 'metalness', {
            min: 0,
            max: 1,
            step: 0.01,
        }).on('change', (event) => {
            store.roughness = 1 - event.value;
            events.emit('object:metalness:update');
            pane.refresh();
        });

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
