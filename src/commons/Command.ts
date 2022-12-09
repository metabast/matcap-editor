/**
 * @param editor pointer to main editor object used to initialize
 *        each command object with a reference to the editor
 * @constructor
 */

import type Editor from '../Editor';

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

    public editor: Editor;

    constructor(editor: Editor) {
        super();
        this.id = -1;
        this.updatable = false;
        this.type = '';
        this.name = '';
        this.editor = editor;
    }

    // eslint-disable-next-line class-methods-use-this
    execute(): void { }

    // eslint-disable-next-line class-methods-use-this
    update(cmd: Command): void { }

    // eslint-disable-next-line class-methods-use-this
    undo(): void { }
}

export { Command };
