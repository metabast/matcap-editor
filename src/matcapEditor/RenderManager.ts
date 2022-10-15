import events from 'src/commons/Events';
import { MatcapEditorStore, type IMatcapEditorStore } from 'src/store';
import type MatcapEditorContent from './MatcapEditorContent';

let store: IMatcapEditorStore;
MatcapEditorStore.subscribe((value) => {
    store = value;
});

interface IData {
    initialized: boolean;
    content: MatcapEditorContent;
    snapshotCounter: number;
    snapshotsArray: string[];
    snapshotLimit: number;
    exported: boolean;
    blobURL: string;
}
const data: IData = {
    initialized: false,
    content: null,
    snapshotCounter: 0,
    snapshotsArray: [],
    snapshotLimit: 1,
    exported: false,
    blobURL: '',
};

const RenderManager = {
    initialize: (content: MatcapEditorContent) => {
        if (data.initialized) return;
        data.initialized = true;
        data.content = content;
        events.on('matcap:snapshot', RenderManager.snapshot);
        events.on('matcap:export:png', RenderManager.snapshot);
        events.on('matcap:generate', RenderManager.snapshots);
    },

    snapshots: () => {
        data.snapshotCounter = 0;
        data.snapshotsArray = [];
        data.snapshotLimit = 9;
        RenderManager.nextSnapshot();
    },

    exportPNG: () => {
        if (!data.blobURL) return;
        const a = document.createElement('a');
        a.href = data.blobURL;
        a.download = 'matcap.png';
        a.click();
    },

    onBlobReady: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        data.blobURL = url;
        if (data.exported) {
            RenderManager.exportPNG();
            data.content.world.renderer.setPixelRatio(1);
        } else {
            data.snapshotCounter += 1;
            data.snapshotsArray.push(url);

            if (data.snapshotCounter < data.snapshotLimit) {
                RenderManager.nextSnapshot();
            } else {
                events.emit('matcap:snapshots:blobs:ready', [
                    ...data.snapshotsArray,
                ]);
                data.snapshotCounter = 0;
                data.snapshotsArray = [];
                data.snapshotLimit = 1;
            }
        }
    },

    snapshot: (payload: { exported: false } = undefined) => {
        data.exported = payload?.exported;
        const arrowHelperVisibleState = data.content.arrowHelper.visible;
        data.content.arrowHelper.visible = false;
        if (data.exported) {
            data.content.world.renderer.setPixelRatio(store.sizes.exportRatio);
        } else {
            data.content.world.renderer.setPixelRatio(1);
        }
        data.content.world.renderer.render(
            data.content.world.scene,
            data.content.cameraSnapshot,
        );
        data.content.arrowHelper.visible = arrowHelperVisibleState;
        data.content.world.renderer.domElement.toBlob(
            RenderManager.onBlobReady,
            'image/png',
            1.0,
        );
    },

    nextSnapshot: () => {
        data.content.sphereRenderMaterial.roughness =
            data.snapshotCounter / (data.snapshotLimit - 1);

        RenderManager.snapshot();
    },
};

export default RenderManager;
