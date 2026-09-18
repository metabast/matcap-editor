import { SetAmbiantLightCommand } from '@/commands/SetAmbiantLightCommand';
import PaneFolderControler from '@/commons/PaneFolderCtrl';
import { isRefreshing } from '@/commons/PaneRefresh';
import { matcapEditorStore } from '@/stores/matcapEditorStore';

type AmbiantParam = 'intensity' | 'color';

/** Same shape as the material folder: bound to the store, holding only old values. */
class SphereAmbiantPaneFolder extends PaneFolderControler {
    private _store = matcapEditorStore();

    private _oldValues: Record<AmbiantParam, number | string> = { intensity: 0, color: '#ffffff' };

    protected _generate(): void {
        super._generate();
        if (!this._paneFolder) return;

        this._store = matcapEditorStore();
        this._oldValues = { ...this._store.ambiant };

        this._bind('intensity', { min: 0, max: 2, step: 0.01 });
        this._bind('color', {});
    }

    private _bind(name: AmbiantParam, options: Record<string, unknown>) {
        this._paneFolder.addBinding(this._store.ambiant, name, options).on('change', (event) => {
            this._editor.scene.applyAmbiant();

            if (!event.last || isRefreshing()) return;

            const value = this._store.ambiant[name];
            this._editor.execute(
                new SetAmbiantLightCommand(this._editor.scene, {
                    name,
                    value,
                    oldValue: this._oldValues[name],
                }),
                `update ambiant ${name}`,
            );
            this._oldValues[name] = value;
        });
    }
}

export default SphereAmbiantPaneFolder;
