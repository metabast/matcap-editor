import type { Command } from '@/commons/Command';
import type Editor from '@/Editor';

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
        this.undos.push(cmd);
        cmd.id = ++this.idCounter;


        cmd.name = optionalName !== undefined ? optionalName : cmd.name;
        cmd.execute();

        this.lastCmdTime = Date.now();

        this.redos = [];
    }

    undo(): Command | undefined {
        let cmd: Command | undefined;

        if (this.undos.length > 0) {
            cmd = this.undos.pop() as Command;
        }

        if (cmd !== undefined) {
            cmd.undo();
            this.redos.push(cmd);
        }

        return cmd;
    }

    redo(): Command | undefined {
        let cmd: Command | undefined;

        if (this.redos.length > 0) {
            cmd = this.redos.pop() as Command;
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
