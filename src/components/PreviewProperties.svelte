<script lang="ts">
    import { PreviewStore, type IPreviewStore } from 'src/store';
    import { Gui } from 'uil';
    import events from '../commons/Events';

    if (import.meta.hot) {
        import.meta.hot.dispose((data) => {
            import.meta.hot.invalidate();
        });
    }

    let store: IPreviewStore;
    PreviewStore.subscribe((newStore) => {
        store = newStore;
    });

    const gui = new Gui({
        css: `
        top: 50px;
        left: 0px;
    `,
        w: 200,
    });

    let grObjects = gui.add('group', { name: 'Objects', h: 30 });
    grObjects
        .add(store, 'power', { min: 0, max: 10, h: 25 })
        .onChange((value) => {
            events.emit('object:power:update');
        });
    grObjects.open();
</script>
