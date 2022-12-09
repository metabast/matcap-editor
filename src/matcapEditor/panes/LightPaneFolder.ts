import type { FolderApi } from '@tweakpane/core';
import { DeleteLightCommand } from 'src/commands/DeleteLightCommand';
import events from 'src/commons/Events';
import type { Pane } from 'tweakpane';
import type LightModel from '../LightModel';
import type MatcapEditorContent from '../MatcapEditorContent';
import LightColor from './lightInput/LightColor';
import LightDistance from './lightInput/LightDistance';
import LightIntensity from './lightInput/LightIntensity';
import LightModelBoolean from './lightInput/LightModelBoolean';
import LightTarget from './lightInput/LightTarget';
import RectAreaLightSize from './lightInput/RectAreaLightSize';
import SpotLightInput from './lightInput/SpotLightInput';

export type DataLightPaneFolder = {
    pane: Pane;
    paneContainer: FolderApi;
    content: MatcapEditorContent;
    currentLightModel: LightModel;
};
const data: DataLightPaneFolder = {
    pane: null,
    paneContainer: null,
    currentLightModel: null,
    content: null,
};

const generate = (content: MatcapEditorContent) => {
    data.content = content;
};

const clean = (): void => {
    data.paneContainer.children.forEach((child) => {
        child.dispose();
    });
};

const updateCurrentLight = (lightModel: LightModel): void => {
    if (data.currentLightModel === lightModel) return;

    data.currentLightModel = lightModel;

    clean();

    LightModelBoolean.addInput(data, 'front');
    LightIntensity.addInput(data);
    LightColor.addInput(data);
    LightDistance.addInput(data);
    if (lightModel.light.type === 'RectAreaLight') {
        RectAreaLightSize.addInput(data, 'width');
        RectAreaLightSize.addInput(data, 'height');
        LightModelBoolean.addInput(data, 'lookAtTarget');
        LightTarget.addInput(data);
    }
    if (lightModel.light.type === 'SpotLight') {
        SpotLightInput.addInput(data, 'distance');
        SpotLightInput.addInput(data, 'angle');
        SpotLightInput.addInput(data, 'penumbra');
        SpotLightInput.addInput(data, 'decay');
    }
    data.paneContainer.addButton({ title: 'Delete' }).on('click', () => {
        clean();
        data.content.world.editor.execute(new DeleteLightCommand(data.content.world.editor, data.currentLightModel));
    });
};

const LightPaneFolder = {
    initialize(pane: Pane) {
        data.pane = pane;
        data.paneContainer = data.pane.addFolder({
            title: 'Current Light',
            expanded: true,
        });
        events.on('matcap:content:ready', generate);
        events.on('matcap:light:update:current', updateCurrentLight);
    },
};

export default LightPaneFolder;
