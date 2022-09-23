import { createNanoEvents } from 'nanoevents';
import type { Emitter } from 'nanoevents';

class Events {
    emitter: Emitter;

    constructor() {
        this.emitter = createNanoEvents();
    }

    on(event: string, callback: (args) => void): void {
        this.emitter.on(event, callback);
    }

    emit(event: string, data?: object): void {
        this.emitter.emit(event, data);
    }

    // eslint-disable-next-line class-methods-use-this
    getNewEmitter(): Emitter {
        return createNanoEvents();
    }
}

export default new Events();
