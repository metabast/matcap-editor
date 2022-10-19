import type { FolderApi } from '@tweakpane/core';
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

const updateCurrentLight = (lightModel: LightModel): void => {
    if (data.currentLightModel === lightModel) return;

    data.currentLightModel = lightModel;

    data.paneContainer.children.forEach((child) => {
        child.dispose();
    });

    LightModelBoolean.addInput(data, 'front');
    LightIntensity.addInput(data);
    LightColor.addInput(data);
    LightDistance.addInput(data);
    if (lightModel.light.type === 'RectAreaLight') {
        RectAreaLightSize.addInput(data, 'width');
        RectAreaLightSize.addInput(data, 'height');
        LightModelBoolean.addInput(data, 'lookAtTarget');
    }
    LightTarget.addInput(data);
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
