import { SetSphereMaterialParamsCommand } from '@/commands/SetSphereMaterialParamsCommand';
import PaneFolderControler from '@/commons/PaneFolderCtrl';
import { isRefreshing } from '@/commons/PaneRefresh';
import { matcapEditorStore } from '@/stores/matcapEditorStore';
import type { Pane, TabPageApi } from 'tweakpane';
import type Editor from '@/Editor';

type MaterialParam = 'roughness' | 'metalness' | 'color';

/**
 * Binds the sphere material folder straight onto the store, which owns these
 * values. The only local state is the previous value each binding needs to build
 * an undoable command.
 */
class SphereMaterialPaneFolderCtrl extends PaneFolderControler {
    private _store = matcapEditorStore();

    private _oldValues: Record<MaterialParam, number | string> = { roughness: 0, metalness: 0, color: '#ffffff' };

    public initialize(pane: Pane, paneContainer: TabPageApi, editor: Editor) {
        super.initialize(pane, paneContainer, editor);
    }

    public get pane() {
        return this._pane;
    }

    protected _generate() {
        if (!this._paneFolder) return;

        this._store = matcapEditorStore();
        this._oldValues = { ...this._store.material };

        this._bind('roughness', { min: 0, max: 1, step: 0.01 });
        this._bind('metalness', { min: 0, max: 1, step: 0.01 });
        this._bind('color', {});
    }

    private _bind(name: MaterialParam, options: Record<string, unknown>) {
        this._paneFolder.addBinding(this._store.material, name, options).on('change', (event) => {
            // Live feedback while dragging; the command only lands on the last event.
            this._editor.scene.applySphereMaterial();

            if (!event.last || isRefreshing()) return;

            const value = this._store.material[name];
            this._editor.execute(
                new SetSphereMaterialParamsCommand(this._editor.scene, {
                    name,
                    value,
                    oldValue: this._oldValues[name],
                }),
                `update material ${name}`,
            );
            this._oldValues[name] = value;
        });
    }
}

export default SphereMaterialPaneFolderCtrl;
