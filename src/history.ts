import type { Command } from './Command';
import type Editor from './Editor';

class History {
    public editor: Editor;

    public undos: Command[];

    public redos: Command[];

    public lastCmdTime: number;

    public idCounter: number;

    constructor(editor: Editor) {
        this.editor = editor;
        this.undos = [];
        this.redos = [];
        this.lastCmdTime = Date.now();
        this.idCounter = 0;
    }

    execute(cmd: Command, optionalName: string) {
        const lastCmd = this.undos[this.undos.length - 1];
        const timeDifference = Date.now() - this.lastCmdTime;

        const isUpdatableCmd = lastCmd && lastCmd.updatable && cmd.updatable && lastCmd.type === cmd.type;

        if (isUpdatableCmd && timeDifference < 500) {
            lastCmd.update(cmd);
            cmd = lastCmd;
        } else {
            this.undos.push(cmd);
            cmd.id = ++this.idCounter;
        }

        cmd.name = optionalName !== undefined ? optionalName : cmd.name;
        cmd.execute();

        this.lastCmdTime = Date.now();

        this.redos = [];
    }

    undo(): Command {
        let cmd: Command;

        if (this.undos.length > 0) {
            cmd = this.undos.pop();
        }

        if (cmd !== undefined) {
            cmd.undo();
            this.redos.push(cmd);
        }

        return cmd;
    }

    redo(): Command {
        let cmd: Command;

        if (this.redos.length > 0) {
            cmd = this.redos.pop();
        }

        if (cmd !== undefined) {
            cmd.execute();
            this.undos.push(cmd);
        }

        return cmd;
    }

    clear() {
        this.undos = [];
        this.redos = [];
        this.idCounter = 0;
    }
}

export { History };
