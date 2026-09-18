import { AddLightCommand } from './AddLightCommand';
import { SetAmbiantLightCommand } from './SetAmbiantLightCommand';
import { SetSphereMaterialParamsCommand } from './SetSphereMaterialParamsCommand';
import { Command } from '@/commons/Command';
import LightModel from '@/matcapEditor/LightModel';
import type { MatcapProject } from '@/ts/types/MatcapProject';
import type SceneService from '@/services/SceneService';

class ImportProjectCommand extends Command {
    private _project: MatcapProject;
    private _commands: Command[];
    constructor(scene: SceneService, project: MatcapProject) {
        super(scene);
        this.type = 'ImportProjectCommand';
        this.name = 'Import Project';
        this.updatable = true;
        this._project = project;
        this._commands = [];
    }

    execute() {
        const { sphereRenderMaterial, sphereRenderAmbiant } = this._project;

        const params: [string, number | string][] = [
            ['roughness', sphereRenderMaterial.roughness],
            ['metalness', sphereRenderMaterial.metalness],
            ['color', sphereRenderMaterial.color],
        ];
        params.forEach(([name, value]) => {
            const command = new SetSphereMaterialParamsCommand(this.scene, { name, value, oldValue: value });
            this._commands.push(command);
            command.execute();
        });

        const ambiantParams: [string, number | string][] = [
            ['intensity', sphereRenderAmbiant.intensity],
            ['color', sphereRenderAmbiant.color],
        ];
        ambiantParams.forEach(([name, value]) => {
            const command = new SetAmbiantLightCommand(this.scene, { name, value, oldValue: value });
            this._commands.push(command);
            command.execute();
        });

        this._project.lights.forEach((light) => {
            const lightModel = LightModel.createFromSerialized(light);
            const command = new AddLightCommand(this.scene, lightModel);
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
