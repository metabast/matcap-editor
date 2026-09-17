import SphereAmbiantPaneFolder from './SphereAmbiantPaneFolder';
import SphereMaterialPaneFolderCtrl from './SphereMaterialPaneFolderCtrl';
import type { FolderApi, TabApi } from '@tweakpane/core';
import type { Pane } from 'tweakpane';
import type Editor from '@/Editor';

const data: { pane: Pane | null; paneFolder: FolderApi | null; tab: TabApi | null } = {
    pane: null,
    paneFolder: null,
    tab: null,
};

const SpherePaneFolder = {
    initialize(pane: Pane, editor: Editor) {
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

        SphereMaterialPaneFolderCtrl.instance.initialize(data.pane, data.tab.pages[0], editor);
        SphereAmbiantPaneFolder.instance.initialize(data.pane, data.tab.pages[1], editor);
    },
};
export default SpherePaneFolder;
