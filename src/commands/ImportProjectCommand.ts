import { Command } from '@/commons/Command';
import type Editor from '@/Editor';
import LightModel from '@/matcapEditor/LightModel';
import { AddLightCommand } from './AddLightCommand';
import type { TProject } from '@/ts/types/TProject';
import SphereMaterialPaneFolderCtrl from '@/matcapEditor/panes/SphereMaterialPaneFolderCtrl';
import { Color } from 'three';
import SphereAmbiantPaneFolder from '@/matcapEditor/panes/SphereAmbiantPaneFolder';

class ImportProjectCommand extends Command {
    private _project: TProject;
    private _commands: Command[];
    constructor(editor: Editor, project: TProject) {
        super(editor);
        this.type = 'ImportProjectCommand';
        this.name = 'Import Project';
        this.updatable = true;
        this._project = project;
        this._commands = [];
    }

    execute() {

        const commandRoughness = SphereMaterialPaneFolderCtrl.instance.createRoughnessCommand(this._project.sphereRenderMaterial.roughness);
        this._commands.push(commandRoughness);
        commandRoughness.execute();

        const commandMetalness = SphereMaterialPaneFolderCtrl.instance.createMetalnessCommand(this._project.sphereRenderMaterial.metalness);
        this._commands.push(commandMetalness);
        commandMetalness.execute();

        const commandColor = SphereMaterialPaneFolderCtrl.instance.createColorCommand(new Color(this._project.sphereRenderMaterial.color).getHex());
        this._commands.push(commandColor);
        commandColor.execute();

        const commandAmbiantInsensity = SphereAmbiantPaneFolder.instance.createAmbiantIntensityCommand(this._project.sphereRenderAmbiant.intensity);
        this._commands.push(commandAmbiantInsensity);
        commandAmbiantInsensity.execute();

        const commandAmbiantColor = SphereAmbiantPaneFolder.instance.createAmbiantColorCommand(new Color(this._project.sphereRenderAmbiant.color).getHex());
        this._commands.push(commandAmbiantColor);
        commandAmbiantColor.execute();


        this._project.lights.forEach((light: any) => {

            const lightModel = LightModel.createFromSerialized(light);
            const command = new AddLightCommand(this.editor, lightModel);
            this._commands.push(command);
            command.execute();
        });
    }

    undo() {
        this._commands.forEach((command) => {
            command.undo();
        });
    }
}

export { ImportProjectCommand };
