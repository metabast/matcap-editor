import { History } from './history';
import { Command } from './commons/Command';
import { describe, expect, it } from 'vitest';
import type SceneService from './services/SceneService';

/**
 * A command that records its own calls, so a test can assert on the order in
 * which History drove it rather than on the state of a scene.
 */
class SpyCommand extends Command {
    public calls: string[] = [];

    constructor(name = '') {
        super(undefined as unknown as SceneService);
        this.name = name;
    }

    execute(): void {
        this.calls.push('execute');
    }

    undo(): void {
        this.calls.push('undo');
    }
}

describe('History', () => {
    it('executes the command and stacks it for undo', () => {
        const history = new History();
        const cmd = new SpyCommand();

        history.execute(cmd, 'Move light');

        expect(cmd.calls).toEqual(['execute']);
        expect(history.undos).toEqual([cmd]);
        expect(history.redos).toEqual([]);
    });

    it('names the command after the optional name', () => {
        const history = new History();
        const cmd = new SpyCommand('Default name');

        history.execute(cmd, 'Move light');

        expect(cmd.name).toBe('Move light');
    });

    it('keeps the command own name when no optional name is given', () => {
        const history = new History();
        const cmd = new SpyCommand('Default name');

        history.execute(cmd, undefined as unknown as string);

        expect(cmd.name).toBe('Default name');
    });

    it('numbers the commands from one, in order of execution', () => {
        const history = new History();
        const first = new SpyCommand();
        const second = new SpyCommand();

        history.execute(first, 'first');
        history.execute(second, 'second');

        expect([first.id, second.id]).toEqual([1, 2]);
    });

    it('undoes the last command and moves it to the redo stack', () => {
        const history = new History();
        const first = new SpyCommand();
        const second = new SpyCommand();
        history.execute(first, 'first');
        history.execute(second, 'second');

        const undone = history.undo();

        expect(undone).toBe(second);
        expect(second.calls).toEqual(['execute', 'undo']);
        expect(first.calls).toEqual(['execute']);
        expect(history.undos).toEqual([first]);
        expect(history.redos).toEqual([second]);
    });

    it('returns undefined and touches nothing when there is nothing to undo', () => {
        const history = new History();

        expect(history.undo()).toBeUndefined();
        expect(history.redos).toEqual([]);
    });

    it('redoes the last undone command and moves it back to the undo stack', () => {
        const history = new History();
        const cmd = new SpyCommand();
        history.execute(cmd, 'cmd');
        history.undo();

        const redone = history.redo();

        expect(redone).toBe(cmd);
        expect(cmd.calls).toEqual(['execute', 'undo', 'execute']);
        expect(history.undos).toEqual([cmd]);
        expect(history.redos).toEqual([]);
    });

    it('returns undefined and touches nothing when there is nothing to redo', () => {
        const history = new History();

        expect(history.redo()).toBeUndefined();
        expect(history.undos).toEqual([]);
    });

    it('unwinds and rewinds several commands in order', () => {
        const history = new History();
        const first = new SpyCommand();
        const second = new SpyCommand();
        history.execute(first, 'first');
        history.execute(second, 'second');

        history.undo();
        history.undo();

        expect(history.undos).toEqual([]);
        expect(history.redos).toEqual([second, first]);

        expect(history.redo()).toBe(first);
        expect(history.redo()).toBe(second);
        expect(history.undos).toEqual([first, second]);
    });

    it('drops the redo stack as soon as a new command is executed', () => {
        const history = new History();
        const undone = new SpyCommand();
        history.execute(undone, 'undone');
        history.undo();
        expect(history.redos).toEqual([undone]);

        const fresh = new SpyCommand();
        history.execute(fresh, 'fresh');

        expect(history.redos).toEqual([]);
        expect(history.undos).toEqual([fresh]);
    });

    it('empties both stacks and resets the id counter on clear', () => {
        const history = new History();
        history.execute(new SpyCommand(), 'first');
        history.execute(new SpyCommand(), 'second');
        history.undo();

        history.clear();

        expect(history.undos).toEqual([]);
        expect(history.redos).toEqual([]);

        const afterClear = new SpyCommand();
        history.execute(afterClear, 'afterClear');
        expect(afterClear.id).toBe(1);
    });
});
