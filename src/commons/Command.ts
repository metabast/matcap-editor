/**
 * @param scene the scene service each command mutates; commands know nothing of
 *        the application shell, so that undo/redo stays pure domain logic
 * @constructor
 */

import type SceneService from '@/services/SceneService';

export interface ICommandOutput {
    type: string;
    id: number;
    name: string;
}

export type CommandJSON = {
    type: string;
    id: number;
    name: string;
};

class Command extends Object {
    public id: number;

    public updatable: boolean;

    public type: string;

    public name: string;

    public scene: SceneService;

    constructor(scene: SceneService) {
        super();
        this.id = -1;
        this.updatable = false;
        this.type = '';
        this.name = '';
        this.scene = scene;
    }

    // eslint-disable-next-line class-methods-use-this
    execute(): void {}

    // eslint-disable-next-line class-methods-use-this
    update(cmd: Command): void {}

    // eslint-disable-next-line class-methods-use-this
    undo(): void {}
}

export { Command };
