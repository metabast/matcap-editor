import { SetSphereMaterialParamsCommand } from '@/commands/SetSphereMaterialParamsCommand';
import PaneFolderControler from '@/commons/PaneFolderCtrl';
import { Color } from 'three';
import type { Pane, TabPageApi } from 'tweakpane';
import type { ValuesPaneCtrl } from '@/ts/types/PanesTypes';

class SphereMaterialPaneFolderCtrl extends PaneFolderControler {
    private _roughnessCtrl: ValuesPaneCtrl;
    private _metalnessCtrl: ValuesPaneCtrl;
    private _colorCtrl: ValuesPaneCtrl;
    constructor() {
        super();
        if (SphereMaterialPaneFolderCtrl._instance) {
            throw new Error(
                'Error: Instantiation failed: Use SphereMaterialPaneFolderCtrl.getInstance() instead of new.',
            );
        }
        SphereMaterialPaneFolderCtrl._instance = this;
    }

    public initialize(pane: Pane, paneContainer: TabPageApi) {
        super.initialize(pane, paneContainer);
    }

    public get pane() {
        return this._pane;
    }

    public get roughnessCtrl() {
        return this._roughnessCtrl;
    }

    public get metalnessCtrl() {
        return this._metalnessCtrl;
    }

    public get colorCtrl() {
        return this._colorCtrl;
    }

    public get serializedParams() {
        return {
            roughness: this._roughnessCtrl.value,
            metalness: this._metalnessCtrl.value,
            color: this._colorCtrl.value,
        };
    }

    protected _generate() {
        if (!this._paneFolder) return;

        this._generateRoughnessFolder();
        this._generateMetalnessFolder();
        this._generateColorFolder();
    }

    private _generateRoughnessFolder() {
        this._roughnessCtrl = {
            value: Number(this._mapcapEditorContent.sphereRenderMaterial.roughness),
            oldValue: Number(this._mapcapEditorContent.sphereRenderMaterial.roughness),
            history: true,
        };
        this._paneFolder
            .addBinding(this._mapcapEditorContent.sphereRenderMaterial, 'roughness', {
                min: 0,
                max: 1,
                step: 0.01,
            })
            .on('change', (event) => {
                if (event.last && this._roughnessCtrl.history) {
                    this._editor.execute(
                        this.createRoughnessCommand(
                            this._mapcapEditorContent.sphereRenderMaterial.roughness,
                            Number(this._roughnessCtrl.value),
                        ),
                        'update material roughness',
                    );
                    this._roughnessCtrl.oldValue = Number(this._mapcapEditorContent.sphereRenderMaterial.roughness);
                }
            });
    }

    private _generateMetalnessFolder() {
        this._metalnessCtrl = {
            value: Number(this._mapcapEditorContent.sphereRenderMaterial.metalness),
            oldValue: Number(this._mapcapEditorContent.sphereRenderMaterial.metalness),
            history: true,
        };
        this._paneFolder
            .addBinding(this._mapcapEditorContent.sphereRenderMaterial, 'metalness', {
                min: 0,
                max: 1,
                step: 0.01,
            })
            .on('change', (event) => {
                if (event.last && this._metalnessCtrl.history) {
                    this._editor.execute(
                        this.createMetalnessCommand(
                            this._mapcapEditorContent.sphereRenderMaterial.metalness,
                            Number(this._metalnessCtrl.value),
                        ),
                        'update material metalness',
                    );
                    this._metalnessCtrl.oldValue = Number(this._mapcapEditorContent.sphereRenderMaterial.metalness);
                }
            });
    }

    private _generateColorFolder() {
        this._colorCtrl = {
            value: `#${this._mapcapEditorContent.sphereRenderMaterial.color.getHexString()}`,
            oldValue: this._mapcapEditorContent.sphereRenderMaterial.color.getHex(),
            history: true,
        };
        this._paneFolder.addBinding(this._colorCtrl, 'value', { label: 'color' }).on('change', (event) => {
            this._mapcapEditorContent.sphereRenderMaterial.color.set(this._colorCtrl.value as Color);
            if (event.last && this._colorCtrl.history) {
                this._editor.execute(
                    this.createColorCommand(
                        this._mapcapEditorContent.sphereRenderMaterial.color.getHex(),
                        Number(this._colorCtrl.oldValue),
                    ),
                    'update material color',
                );
                this._colorCtrl.oldValue = new Color(this._colorCtrl.value as Color).getHex();
            }
        });
    }

    public createRoughnessCommand(value: number, oldValue?: number) {
        return new SetSphereMaterialParamsCommand(
            this._editor,
            {
                name: 'roughness',
                value,
                oldValue: oldValue || value,
            },
            this._pane,
            this._roughnessCtrl,
        );
    }

    public createMetalnessCommand(value: number, oldValue?: number) {
        return new SetSphereMaterialParamsCommand(
            this._editor,
            {
                name: 'metalness',
                value,
                oldValue: oldValue || value,
            },
            this._pane,
            this._metalnessCtrl,
        );
    }

    public createColorCommand(value: number, oldValue?: number) {
        return new SetSphereMaterialParamsCommand(
            this._editor,
            {
                name: 'color',
                value,
                oldValue: oldValue || value,
            },
            this._pane,
            this._colorCtrl,
        );
    }

    // SINGLETON
    private static _instance: SphereMaterialPaneFolderCtrl;
    public static get instance(): SphereMaterialPaneFolderCtrl {
        if (!this._instance) {
            this._instance = new SphereMaterialPaneFolderCtrl();
        }
        return this._instance;
    }
}

export default SphereMaterialPaneFolderCtrl;
