import events from '@/commons/Events';
import { matcapEditorStore } from '@/stores/matcapEditorStore';
import type MatcapEditorContent from './MatcapEditorContent';

let _store: any;

let _content: MatcapEditorContent;
let _initialized = false;
let _snapshotCounter = 0;
let _snapshotsArray: string[] = [];
let _snapshotLimit = 1;
let _exported = false;
let _blobURL = '';

const RenderManager = {
    initialize: (content: MatcapEditorContent) => {
        if (_initialized) return;
        _initialized = true;
        _content = content;
        _store = matcapEditorStore();
        events.on('matcap:snapshot', RenderManager.snapshot);
        events.on('matcap:export:png', RenderManager.snapshot);
        events.on('matcap:generate', RenderManager.snapshots);
    },

    snapshots: () => {
        _snapshotCounter = 0;
        _snapshotsArray = [];
        _snapshotLimit = 9;
        RenderManager.nextSnapshot();
    },

    exportPNG: () => {
        if (!_blobURL) return;
        const a = document.createElement('a');
        a.href = _blobURL;
        a.download = 'matcap.png';
        a.click();
    },

    onBlobReady: (blob: Blob | null): void => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        _blobURL = url;
        if (_exported) {
            RenderManager.exportPNG();
            _content.world.renderer.setPixelRatio(1);
        } else {
            _snapshotCounter += 1;
            _snapshotsArray.push(url);

            if (_snapshotCounter < _snapshotLimit) {
                RenderManager.nextSnapshot();
            } else {
                events.emit('matcap:snapshots:blobs:ready', [
                    ..._snapshotsArray,
                ]);
                _snapshotCounter = 0;
                _snapshotsArray = [];
                _snapshotLimit = 1;
            }
        }
    },

    snapshot: (payload = { exported: false }) => {
        _exported = payload?.exported;
        const arrowHelperVisibleState = _content?.arrowHelper.visible;
        _content.arrowHelper.visible = false;
        if (_exported) {
            _content?.world.renderer.setPixelRatio(_store.sizes.exportRatio);
        } else {
            _content?.world.renderer.setPixelRatio(1);
        }
        _content.world.renderer.render(
            _content.world.scene,
            _content.cameraSnapshot,
        );
        _content.arrowHelper.visible = arrowHelperVisibleState;
        _content.world.renderer.domElement.toBlob(
            RenderManager.onBlobReady,
            'image/png',
            1.0,
        );
    },

    nextSnapshot: () => {
        _content.sphereRenderMaterial.roughness =
            _snapshotCounter / (_snapshotLimit - 1);

        RenderManager.snapshot();
    },
};

export default RenderManager;
