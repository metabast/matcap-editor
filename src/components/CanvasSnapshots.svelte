<script lang="ts">
    import events from 'src/commons/Events';
    import { PreviewStore, type IPreviewStore } from 'src/store';
    import { onMount } from 'svelte';

    let store: IPreviewStore;
    PreviewStore.subscribe((newStore) => {
        store = newStore;
    });

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;
    let refreshNb: number = 0;

    onMount(() => {
        canvas = document.querySelector('canvas.snapshots');
        context = canvas.getContext('2d');
    });

    const onBlobReady = (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        events.emit('matcap:editor:snapshots:ready', {
            matcap: url,
            refreshNb,
        });
    };

    events.on('matcap:snapshots:blobs:ready', (urls: [string]) => {
        const promises = [];
        refreshNb = urls.length;
        for (let i = 0; i < urls.length; i++) {
            const url: string = urls[i];
            const img = new Image();
            promises.push(
                new Promise((resolve) => {
                    img.onload = () => {
                        var posY = Math.floor(i / 3);
                        var posX = i % 3;
                        context.drawImage(
                            img,
                            posX * 256,
                            posY * 256,
                            256,
                            256,
                        );
                        resolve(true);
                    };
                    img.src = url;
                }),
            );
        }
        Promise.all(promises).then(() => {
            canvas.toBlob(onBlobReady, 'image/png', 1.0);
        });
    });
</script>

<canvas
    class="snapshots"
    width="768"
    height="768"
    style="z-index: {store.showGrid ? '1' : '-1'};"
/>

<code class="store">{store.showGrid}</code>

<style>
    .snapshots {
        position: absolute;
        width: 512px;
        height: 512px;
        bottom: 0;
    }
    .store {
        position: absolute;
        bottom: 0;
        right: 0;
    }
</style>
