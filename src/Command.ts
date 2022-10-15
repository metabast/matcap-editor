/**
 * @param editor pointer to main editor object used to initialize
 *        each command object with a reference to the editor
 * @constructor
 */

import type Editor from './Editor';

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

    public inMemory: boolean;

    public updatable: boolean;

    public type: string;

    public name: string;

    public attributeName: string;

    public editor: Editor;

    public object: object;

    public json: CommandJSON;

    constructor(editor: Editor) {
        super();
        this.id = -1;
        this.inMemory = false;
        this.updatable = false;
        this.type = '';
        this.name = '';
        this.editor = editor;
    }

    toJSON() {
        const output = <ICommandOutput>{};
        output.type = this.type;
        output.id = this.id;
        output.name = this.name;
        return output;
    }

    fromJSON(json: CommandJSON) {
        this.inMemory = true;
        this.type = json.type;
        this.id = json.id;
        this.name = json.name;
    }

    // eslint-disable-next-line class-methods-use-this
    execute(): void {}

    // eslint-disable-next-line class-methods-use-this
    update(cmd: Command): void {}

    // eslint-disable-next-line class-methods-use-this
    undo(): void {}
}

export { Command };
