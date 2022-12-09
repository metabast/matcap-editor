<script lang="ts">
    import { MatcapEditorStore, type IMatcapEditorStore } from 'src/store';
    import events from 'src/commons/Events';

    import { onMount } from 'svelte';
    import { Pane } from 'tweakpane';
    import SpherePaneFolder from 'src/matcapEditor/panes/SpherePaneFolder';
    import CreatePaneFolder from 'src/matcapEditor/panes/CreatePaneFolder';
    import LightPaneFolder from 'src/matcapEditor/panes/LightPaneFolder';
    import ExportMatcapPaneFolder from 'src/matcapEditor/panes/ExportMatcapPaneFolder';

    let store: IMatcapEditorStore;
    MatcapEditorStore.subscribe((newStore) => {
        store = newStore;
    });
    let pane: Pane;
    onMount(() => {
        pane = new Pane({
            container: document.querySelector('.matcap-editor-pane'),
        });

        CreatePaneFolder.initialize(pane);

        pane.addInput(store.create, 'front', {
            label: 'front/back',
        });
        pane.addButton({
            title: 'generate',
        }).on('click', () => {
            events.emit('matcap:generate', { exported: true });
        });

        ExportMatcapPaneFolder.initialize(pane);

        SpherePaneFolder.initialize(pane);

        LightPaneFolder.initialize(pane);
    });

    $: getStyles = () => `
        top: ${store.sizes.view + 2}px;
    `;
</script>

<div class="matcap-editor-pane" style={getStyles()} />

<style>
    .matcap-editor-pane {
        position: fixed;
        right: 0px;
        z-index: 1;
        user-select: none;
    }
</style>
