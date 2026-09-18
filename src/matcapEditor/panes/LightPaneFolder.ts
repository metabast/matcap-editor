import LightColor from './lightInput/LightColor';
import LightDistance from './lightInput/LightDistance';
import LightIntensity from './lightInput/LightIntensity';
import LightModelBoolean from './lightInput/LightModelBoolean';
import LightTarget from './lightInput/LightTarget';
import RectAreaLightSize from './lightInput/RectAreaLightSize';
import SpotLightInput from './lightInput/SpotLightInput';
import events from '@/commons/Events';
import { DeleteLightCommand } from '@/commands/DeleteLightCommand';
import type Editor from '@/Editor';
import type MatcapEditorContent from '../MatcapEditorContent';
import type LightModel from '../LightModel';
import type { Pane } from 'tweakpane';
import type { FolderApi } from '@tweakpane/core';
import type { Unsubscribe } from 'nanoevents';

export type DataLightPaneFolder = {
    editor: Editor;
    pane: Pane;
    paneContainer: FolderApi;
    content: MatcapEditorContent;
    currentLightModel?: LightModel;
    /** Unsubscribers owned by the bindings currently in the folder. */
    bindingUnsubscribes?: Unsubscribe[];
};

let data: DataLightPaneFolder;
let _unsubscribe: Unsubscribe | undefined;

/**
 * Bindings are rebuilt on every light selection, so whatever they subscribed to
 * has to go with them — disposing the widget does not detach its listener.
 */
const clean = (): void => {
    data.bindingUnsubscribes?.forEach((unsubscribe) => unsubscribe());
    data.bindingUnsubscribes = [];
    data.paneContainer?.children.forEach((child) => {
        child.dispose();
    });
};

const updateCurrentLight = (lightModel: LightModel): void => {
    if (data.currentLightModel === lightModel) return;

    data.currentLightModel = lightModel;

    clean();

    LightModelBoolean.addBinding(data, 'front');
    LightIntensity.addBinding(data);
    LightColor.addBinding(data);
    LightDistance.addBinding(data);
    if (lightModel.light.type === 'RectAreaLight') {
        RectAreaLightSize.addBinding(data, 'width');
        RectAreaLightSize.addBinding(data, 'height');
        LightModelBoolean.addBinding(data, 'lookAtTarget');
        LightTarget.addBinding(data);
    }
    if (lightModel.light.type === 'SpotLight') {
        SpotLightInput.addBinding(data, 'distance');
        SpotLightInput.addBinding(data, 'angle');
        SpotLightInput.addBinding(data, 'penumbra');
        SpotLightInput.addBinding(data, 'decay');
    }
    data.paneContainer?.addButton({ title: 'Delete' }).on('click', () => {
        if (!data.currentLightModel) return;
        clean();
        data.editor.execute(new DeleteLightCommand(data.editor.scene, data.currentLightModel));
    });
};

const LightPaneFolder = {
    initialize(pane: Pane, editor: Editor) {
        const paneContainer = pane.addFolder({
            title: 'Current Light',
            expanded: true,
        });
        const { content } = editor.matcapEditorWorld;
        data = {
            editor,
            pane,
            paneContainer,
            content,
            bindingUnsubscribes: [],
        };
        _unsubscribe = events.on('matcap:light:update:current', updateCurrentLight);
    },

    dispose() {
        _unsubscribe?.();
        _unsubscribe = undefined;
    },
};

export default LightPaneFolder;
