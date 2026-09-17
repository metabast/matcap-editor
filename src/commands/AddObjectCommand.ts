import { Command } from '@/commons/Command';
import type SceneService from '@/services/SceneService';
import type { Object3D } from 'three';

class AddObjectCommand extends Command {
    private object3d: Object3D;

    constructor(scene: SceneService, object3d: Object3D) {
        super(scene);
        this.type = 'AddObjectCommand';
        this.name = 'Add Object';
        this.updatable = true;
        this.object3d = object3d;
    }

    execute() {
        this.scene.addObject(this.object3d);
    }

    undo() {
        this.scene.removeObject(this.object3d);
    }
}

export { AddObjectCommand };
