import { SetSphereMaterialParamsCommand } from './SetSphereMaterialParamsCommand';
import { SetAmbiantLightCommand } from './SetAmbiantLightCommand';
import { AddLightCommand } from './AddLightCommand';
import { History } from '@/history';
import { describe, expect, it } from 'vitest';
import type SceneService from '@/services/SceneService';
import type LightModel from '@/matcapEditor/LightModel';

type Call = [string, ...unknown[]];

/**
 * Manual double of the only collaborator a command has. SceneService exposes a
 * handful of mutations and nothing else, so recording the calls is enough to
 * pin down what a command does — no mocking library needed.
 */
class SceneServiceDouble {
    public calls: Call[] = [];

    setSphereMaterialParam(name: string, value: number | string): void {
        this.calls.push(['setSphereMaterialParam', name, value]);
    }

    setAmbiantParam(name: string, value: number | string): void {
        this.calls.push(['setAmbiantParam', name, value]);
    }

    addLight(lightModel: LightModel): void {
        this.calls.push(['addLight', lightModel]);
    }

    deleteLight(lightModel: LightModel): void {
        this.calls.push(['deleteLight', lightModel]);
    }

    asSceneService(): SceneService {
        return this as unknown as SceneService;
    }
}

describe('SetSphereMaterialParamsCommand', () => {
    it('pushes the new value on execute and the old one on undo', () => {
        const scene = new SceneServiceDouble();
        const cmd = new SetSphereMaterialParamsCommand(scene.asSceneService(), {
            name: 'roughness',
            value: 0.8,
            oldValue: 0.2,
        });

        cmd.execute();
        cmd.undo();

        expect(scene.calls).toEqual([
            ['setSphereMaterialParam', 'roughness', 0.8],
            ['setSphereMaterialParam', 'roughness', 0.2],
        ]);
    });

    it('carries the parameter name through, colors included', () => {
        const scene = new SceneServiceDouble();
        const cmd = new SetSphereMaterialParamsCommand(scene.asSceneService(), {
            name: 'color',
            value: '#ff0000',
            oldValue: '#00ff00',
        });

        cmd.execute();

        expect(scene.calls).toEqual([['setSphereMaterialParam', 'color', '#ff0000']]);
    });
});

describe('SetAmbiantLightCommand', () => {
    it('pushes the new value on execute and the old one on undo', () => {
        const scene = new SceneServiceDouble();
        const cmd = new SetAmbiantLightCommand(scene.asSceneService(), {
            name: 'intensity',
            value: 3,
            oldValue: 1,
        });

        cmd.execute();
        cmd.undo();

        expect(scene.calls).toEqual([
            ['setAmbiantParam', 'intensity', 3],
            ['setAmbiantParam', 'intensity', 1],
        ]);
    });
});

describe('AddLightCommand', () => {
    it('adds the light on execute and removes that same light on undo', () => {
        const scene = new SceneServiceDouble();
        const lightModel = { id: 'light-1' } as unknown as LightModel;
        const cmd = new AddLightCommand(scene.asSceneService(), lightModel);

        cmd.execute();
        cmd.undo();

        expect(scene.calls).toEqual([
            ['addLight', lightModel],
            ['deleteLight', lightModel],
        ]);
    });
});

describe('a command driven by History', () => {
    it('applies the new value, reverts it on undo and reapplies it on redo', () => {
        const scene = new SceneServiceDouble();
        const history = new History();
        const cmd = new SetSphereMaterialParamsCommand(scene.asSceneService(), {
            name: 'metalness',
            value: 1,
            oldValue: 0,
        });

        history.execute(cmd, 'Set metalness');
        history.undo();
        history.redo();

        expect(scene.calls).toEqual([
            ['setSphereMaterialParam', 'metalness', 1],
            ['setSphereMaterialParam', 'metalness', 0],
            ['setSphereMaterialParam', 'metalness', 1],
        ]);
    });
});
