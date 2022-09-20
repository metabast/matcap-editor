import { createNanoEvents } from 'nanoevents';
import type { Emitter } from 'nanoevents';

// const emitter = createNanoEvents();
// export default {
//     on(event: string, callback: () => void): void {
//         emitter.on(event, callback);
//     },
//     emit(event: string, data?: object): void {
//         emitter.emit(event, data);
//     },
//     getNewEmitter(): Emitter {
//         return createNanoEvents();
//     },
// };

class Events {
    emitter: Emitter;

    constructor() {
        this.emitter = createNanoEvents();
    }

    on(event: string, callback: () => void): void {
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
