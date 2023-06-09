import { AmbientLight, Color } from 'three';
import { SetAmbiantLightCommand } from '@/commands/SetAmbiantLightCommand';
import type { ValuesPaneCtrl } from '@/ts/types/PanesTypes';
import PaneFolderControler from '@/commons/PaneFolderCtrl';

class SphereAmbiantPaneFolder extends PaneFolderControler {
    _intensityCtrl: ValuesPaneCtrl;
    _colorCtrl: ValuesPaneCtrl;
    private _ambiantLight: AmbientLight;
    constructor() {
        super();
        if (SphereAmbiantPaneFolder._instance) {
            throw new Error('Error: Instantiation failed: Use SphereAmbiantPaneFolder.getInstance() instead of new.');
        }
        SphereAmbiantPaneFolder._instance = this;
    }

    public get serializedParams() {
        return {
            intensity: this._intensityCtrl.value,
            color: this._colorCtrl.value,
        };
    }

    protected _generate(): void {
        super._generate();
        this._ambiantLight = this._mapcapEditorContent.ambiantLight;
        this._generateIntensityFolder();
        this._generateColorFolder();
    }

    private _generateIntensityFolder() {
        this._intensityCtrl = {
            value: Number(this._ambiantLight.intensity),
            oldValue: Number(this._ambiantLight.intensity),
            history: true,
        };
        this._paneFolder
            .addInput(this._intensityCtrl, 'value', {
                min: 0,
                max: 2,
                step: 0.01,
            })
            .on('change', (event) => {
                this._ambiantLight.intensity = Number(event.value);
                if (event.last && this._intensityCtrl.history) {
                    this._editor.execute(
                        this.createAmbiantIntensityCommand(this._ambiantLight.intensity, Number(this._intensityCtrl.oldValue)),
                        'update ambiant intensity',
                    );
                    this._intensityCtrl.oldValue = Number(this._ambiantLight.intensity);
                }
            });
    }

    private _generateColorFolder() {
        this._colorCtrl = {
            value: `#${this._ambiantLight.color.getHexString()}`,
            oldValue: this._ambiantLight.color.getHex(),
            history: true,
        };
        this._paneFolder.addInput(this._colorCtrl, 'value', { label: 'color' }).on('change', (event) => {
            this._ambiantLight.color.set(this._colorCtrl.value as Color);
            if (event.last && this._colorCtrl.history) {
                this._editor.execute(
                    this.createAmbiantColorCommand(this._ambiantLight.color.getHex(), Number(this._colorCtrl.oldValue)),
                    'update material color',
                );
                this._colorCtrl.oldValue = new Color(this._colorCtrl.value as Color).getHex();
            }
        });
    }

    public createAmbiantIntensityCommand(value: number, oldValue?: number) {
        return new SetAmbiantLightCommand(
            this._editor,
            {
                name: 'intensity',
                value: value,
                oldValue: oldValue || value,
            },
            this._ambiantLight,
            this._pane,
            this._intensityCtrl,
        );
    }

    public createAmbiantColorCommand(value: number, oldValue?: number) {
        return new SetAmbiantLightCommand(
            this._editor,
            {
                name: 'color',
                value: value,
                oldValue: oldValue || value,
            },
            this._ambiantLight,
            this._pane,
            this._colorCtrl,
        );
    }

    // SINGLETON
    private static _instance: SphereAmbiantPaneFolder;
    public static get instance(): SphereAmbiantPaneFolder {
        if (!this._instance) this._instance = new SphereAmbiantPaneFolder();
        return this._instance;
    }
}

export default SphereAmbiantPaneFolder;
