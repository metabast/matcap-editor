import type { FolderApi, TabApi, TabPageApi } from '@tweakpane/core';
import type { Pane } from 'tweakpane';
import SphereAmbiantPaneFolder from './SphereAmbiantPaneFolder';
import SphereMaterialPaneFolder from './SphereMaterialPaneFolder';

const data: { pane: Pane; paneFolder: FolderApi; tab: TabApi } = {
    pane: null,
    paneFolder: null,
    tab: null,
};

const SpherePaneFolder = {
    initialize(pane: Pane) {
        data.pane = pane;
        data.paneFolder = data.pane.addFolder({
            title: 'Sphere',
            expanded: true,
        });
        data.tab = data.paneFolder.addTab({
            pages: [
                {
                    title: 'Material',
                },
                {
                    title: 'Ambiant',
                },
            ],
        });

        SphereMaterialPaneFolder.initialize(data.pane, data.tab.pages[0]);
        SphereAmbiantPaneFolder.initialize(data.pane, data.tab.pages[1]);
    },
};
export default SpherePaneFolder;
