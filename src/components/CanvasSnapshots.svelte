<script lang="ts">
    import events from 'src/commons/Events';
    import { onMount } from 'svelte';
    import Canvas3D from './Canvas3D.svelte';

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;

    onMount(() => {
        canvas = document.querySelector('canvas.snapshots');
        context = canvas.getContext('2d');
    });

    const onBlobReady = (blob) => {
        const url = URL.createObjectURL(blob);
        events.emit('matcap:editor:snapshots:ready', { matcap: url });
    };

    events.on('matcap:snapshots:blobs:ready', (urls: [string]) => {
        const promises = [];
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
            events.emit('matcap:snapshots:rendered');
        });
    });
</script>

<canvas class="snapshots" width="768" height="768" />

<style>
    .snapshots {
        position: absolute;
        z-index: -1;
        width: 512px;
        height: 512px;
        bottom: 0;
    }
</style>
