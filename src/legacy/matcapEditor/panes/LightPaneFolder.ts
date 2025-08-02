import type { FolderApi } from '@tweakpane/core';
import { DeleteLightCommand } from '@/legacy/commands/DeleteLightCommand';
import events from '@/legacy/commons/Events';
import type { Pane } from 'tweakpane';
import type LightModel from '@/legacy/matcapEditor/LightModel';
import type MatcapEditorContent from '@/legacy/matcapEditor/MatcapEditorContent';
import LightColor from '@/legacy/matcapEditor/panes/lightInput/LightColor';
import LightDistance from '@/legacy/matcapEditor/panes/lightInput/LightDistance';
import LightIntensity from '@/legacy/matcapEditor/panes/lightInput/LightIntensity';
import LightModelBoolean from '@/legacy/matcapEditor/panes/lightInput/LightModelBoolean';
import LightTarget from '@/legacy/matcapEditor/panes/lightInput/LightTarget';
import RectAreaLightSize from '@/legacy/matcapEditor/panes/lightInput/RectAreaLightSize';
import SpotLightInput from '@/legacy/matcapEditor/panes/lightInput/SpotLightInput';
import Editor from '@/legacy/Editor';

export type DataLightPaneFolder = {
    pane: Pane;
    paneContainer: FolderApi;
    content: MatcapEditorContent;
    currentLightModel?: LightModel;
};

let data: DataLightPaneFolder;

const generate = (content: MatcapEditorContent) => {
    data.content = content;
};

const clean = (): void => {
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
        Editor.instance.execute(new DeleteLightCommand(Editor.instance, data.currentLightModel));
    });
};

const LightPaneFolder = {
    initialize(pane: Pane) {
        const paneContainer = pane.addFolder({
            title: 'Current Light',
            expanded: true,
        });
        const content = Editor.instance.matcapEditorWorld.content;
        data = {
            pane,
            paneContainer,
            content,
        };
        events.on('matcap:light:update:current', updateCurrentLight);
    },
};

export default LightPaneFolder;
