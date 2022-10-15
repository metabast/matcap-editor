import type { Command, CommandJSON } from './Command';
import * as Commands from './commands';
import type Editor from './Editor';

class History {
    public editor: Editor;

    public undos: Command[];

    public redos: Command[];

    public lastCmdTime: number;

    public idCounter: number;

    public historyDisabled: boolean;

    constructor(editor: Editor) {
        this.editor = editor;
        this.undos = [];
        this.redos = [];
        this.lastCmdTime = Date.now();
        this.idCounter = 0;

        this.historyDisabled = false;
    }

    execute(cmd: Command, optionalName: string) {
        const lastCmd = this.undos[this.undos.length - 1];
        const timeDifference = Date.now() - this.lastCmdTime;

        const isUpdatableCmd =
            lastCmd &&
            lastCmd.updatable &&
            cmd.updatable &&
            lastCmd.object === cmd.object &&
            lastCmd.type === cmd.type &&
            lastCmd.attributeName === cmd.attributeName;

        if (isUpdatableCmd && cmd.type === 'SetScriptValueCommand') {
            // When the cmd.type is "SetScriptValueCommand" the timeDifference is ignored

            lastCmd.update(cmd);
            cmd = lastCmd;
        } else if (isUpdatableCmd && timeDifference < 500) {
            lastCmd.update(cmd);
            cmd = lastCmd;
        } else {
            // the command is not updatable and is added as a new part of the history

            this.undos.push(cmd);
            cmd.id = ++this.idCounter;
        }

        cmd.name = optionalName !== undefined ? optionalName : cmd.name;
        cmd.execute();
        cmd.inMemory = true;

        this.lastCmdTime = Date.now();

        // clearing all the redo-commands

        this.redos = [];
    }

    undo(): Command {
        if (this.historyDisabled) {
            alert('Undo/Redo disabled while scene is playing.');
            return null;
        }

        let cmd: Command;

        if (this.undos.length > 0) {
            cmd = this.undos.pop();

            if (cmd.inMemory === false) {
                cmd.fromJSON(cmd.json);
            }
        }

        if (cmd !== undefined) {
            cmd.undo();
            this.redos.push(cmd);
        }

        return cmd;
    }

    redo(): Command {
        if (this.historyDisabled) {
            alert('Undo/Redo disabled while scene is playing.');
            return null;
        }

        let cmd: Command;

        if (this.redos.length > 0) {
            cmd = this.redos.pop();

            if (cmd.inMemory === false) {
                cmd.fromJSON(cmd.json);
            }
        }

        if (cmd !== undefined) {
            cmd.execute();
            this.undos.push(cmd);
        }

        return cmd;
    }

    toJSON() {
        const history: { undos: CommandJSON[]; redos: CommandJSON[] } = {
            undos: [],
            redos: [],
        };
        history.undos = [];
        history.redos = [];

        // Append Undos to History

        for (let i = 0; i < this.undos.length; i++) {
            if (this.undos[i].json) {
                history.undos.push(this.undos[i].json);
            }
        }

        // Append Redos to History

        for (let i = 0; i < this.redos.length; i++) {
            if (this.redos[i].json) {
                history.redos.push(this.redos[i].json);
            }
        }

        return history;
    }

    fromJSON(json: { undos: []; redos: [] }) {
        if (json === undefined) return;

        for (let i = 0; i < json.undos.length; i++) {
            const cmdJSON: Command = json.undos[i];
            const cmd: Command = new Commands[cmdJSON.type](this.editor); // creates a new object of type "json.type"
            cmd.json = cmdJSON;
            cmd.id = cmdJSON.id;
            cmd.name = cmdJSON.name;
            this.undos.push(cmd);
            this.idCounter =
                cmdJSON.id > this.idCounter ? cmdJSON.id : this.idCounter; // set last used idCounter
        }

        for (let i = 0; i < json.redos.length; i++) {
            const cmdJSON: Command = json.redos[i];
            const cmd: Command = new Commands[cmdJSON.type](this.editor); // creates a new object of type "json.type"
            cmd.json = cmdJSON;
            cmd.id = cmdJSON.id;
            cmd.name = cmdJSON.name;
            this.redos.push(cmd);
            this.idCounter =
                cmdJSON.id > this.idCounter ? cmdJSON.id : this.idCounter; // set last used idCounter
        }

        // Select the last executed undo-command
    }

    clear() {
        this.undos = [];
        this.redos = [];
        this.idCounter = 0;
    }

    goToState(id) {
        if (this.historyDisabled) {
            alert('Undo/Redo disabled while scene is playing.');
            return;
        }

        let cmd =
            this.undos.length > 0
                ? this.undos[this.undos.length - 1]
                : undefined; // next cmd to pop

        if (cmd === undefined || id > cmd.id) {
            cmd = this.redo();
            while (cmd !== undefined && id > cmd.id) {
                cmd = this.redo();
            }
        } else {
            while (true) {
                cmd = this.undos[this.undos.length - 1]; // next cmd to pop

                if (cmd === undefined || id === cmd.id) break;

                this.undo();
            }
        }
    }

    enableSerialization(id) {
        /**
         * because there might be commands in this.undos and this.redos
         * which have not been serialized with .toJSON() we go back
         * to the oldest command and redo one command after the other
         * while also calling .toJSON() on them.
         */

        this.goToState(-1);

        let cmd: Command = this.redo();
        while (cmd !== undefined) {
            if (!cmd.json) {
                cmd.json = cmd.toJSON();
            }

            cmd = this.redo();
        }

        this.goToState(id);
    }
}

export { History };
