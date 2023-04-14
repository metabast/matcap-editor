<template >
    <canvas class="snapshots"
width="768"
height="768"
:style="`z-index: ${store.showGrid ? '1' : '-1'};`" />
</template >

<script lang="ts" setup >
import events from '@/commons/Events';
import { matcapPreviewStore } from '@/stores/matcapPreviewStore';
import { computed, onMounted } from 'vue';

if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        import.meta.hot?.invalidate();
    });
}

const debugCellsWithNumbers = false;
const store = computed(() => matcapPreviewStore());

let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let refreshNb: number = 0;
let currentBlobURL: string = '';
onMounted(() => {
    canvas = document.querySelector('canvas.snapshots') as HTMLCanvasElement;
    context = canvas.getContext('2d') as CanvasRenderingContext2D;
});

const onBlobReady = (blob: Blob | null) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    currentBlobURL = url;

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
                    if(debugCellsWithNumbers) {
                        context.font = '30px Arial';
                        context.fillStyle = 'red';
                        context.textAlign = 'center';
                        context.fillText(String(i), 256*.5 + posX * 256, 256*.5 + posY * 256);
                    }
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

events.on('matcap:export:grid:png', () => {
    if(!currentBlobURL) return;
    const a = document.createElement('a');
    a.href = currentBlobURL;
    a.download = 'matcap.png';
    a.click();
});

</script >