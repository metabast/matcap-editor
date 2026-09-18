import { debounce } from './Utils';
import { debounceDelay } from './Constants';
import { createNanoEvents } from 'nanoevents';
import type { Unsubscribe } from 'nanoevents';
import type { Mesh } from 'three';
import type Editor from '@/Editor';
import type LightModel from '@/matcapEditor/LightModel';
import type MatcapPreviewContent from '@/matcapPreview/MatcapPreviewContent';
import type { MatcapProject } from '@/ts/types/MatcapProject';

/** A snapshot at export resolution, as opposed to the preview-sized one. */
type SnapshotRequest = { exported: boolean };

/**
 * The whole vocabulary of the bus: one entry per channel, the value being the
 * listener's signature. Adding a channel means adding it here first, and
 * renaming one turns every call site red — which is the point: the channel
 * names used to be free-form strings that no compiler ever checked.
 */
export interface EventMap {
    // Composition root
    'matcap:editor:ready': (editor: Editor) => void;
    'matcap:preview:content:ready': (content: MatcapPreviewContent) => void;

    // Rendering
    'matcap:snapshot': () => void;
    'matcap:generate': (payload: SnapshotRequest) => void;
    'matcap:snapshots:blobs:ready': (urls: string[]) => void;
    'matcap:editor:snapshots:ready': (payload: { matcap: string; refreshNb: number }) => void;

    // Import / export
    'matcap:export:png': (payload: SnapshotRequest) => void;
    'matcap:export:grid:png': () => void;
    'matcap:export:project': () => void;
    'matcap:project:read': (project: MatcapProject) => void;
    'files:dropped': (files: FileList) => void;
    'show:dragNdrop': (payload: { msg: string }) => void;

    // Panes
    'matcap:ui:pane:refresh': () => void;
    'light:change': (payload: { propertyName: 'front' | 'lookAtTarget'; value: boolean }) => void;

    // Lights
    'matcap:light:update:current': (lightModel: LightModel) => void;
    'matcap:ui:light:update:current': (lightModel: LightModel) => void;
    'matcap:light:startMoving': (lightModel: LightModel) => void;
    'matcap:editor:light:added': (lightModel: LightModel) => void;
    'matcap:editor:light:remove': (lightModel: LightModel) => void;

    // Preview material
    'matcap:preview:mesh:selected': (mesh: Mesh | undefined) => void;
    'object:power:update': () => void;
    'object:roughness:update': () => void;
    'object:metalness:update': () => void;
}

class Events {
    private emitter = createNanoEvents<EventMap>();

    /**
     * Returns the unsubscribe function. Callers that outlive nothing — a module
     * living as long as the page — may ignore it; anything with a lifecycle
     * (component, world content, service) must call it on teardown, otherwise
     * the listener keeps the whole object alive after its world is destroyed.
     */
    on<K extends keyof EventMap>(event: K, callback: EventMap[K]): Unsubscribe {
        return this.emitter.on(event, callback);
    }

    emit<K extends keyof EventMap>(event: K, ...args: Parameters<EventMap[K]>): void {
        this.emitter.emit(event, ...args);
    }
}
const events = new Events();
export default events;

const emitSnapshot = debounce(() => {
    events.emit('matcap:snapshot');
}, debounceDelay);

export { emitSnapshot };
