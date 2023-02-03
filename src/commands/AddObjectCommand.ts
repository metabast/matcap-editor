import { Command } from '@/commons/Command';
import type Editor from '@/Editor';
import type { Object3D } from 'three';

class AddObjectCommand extends Command {
    private object3d: Object3D;

    constructor(editor: Editor, object3d: Object3D) {
        super(editor);
        this.type = 'AddObjectCommand';
        this.name = 'Add Object';
        this.updatable = true;
        this.object3d = object3d;
    }

    execute() {
        this.editor.addObject(this.object3d);
    }

    undo() {
        this.editor.removeObject(this.object3d);
    }
}

export { AddObjectCommand };
