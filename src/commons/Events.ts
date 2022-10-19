import { createNanoEvents } from 'nanoevents';
import type { Emitter } from 'nanoevents';
import { debounce } from './Utils';
import { debounceDelay } from './Constants';

class Events {
    emitter: Emitter;

    constructor() {
        this.emitter = createNanoEvents();
    }

    on(event: string, callback: (...args: any) => void): void {
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
const events = new Events();
export default events;

const emitSnapshot = debounce(() => {
    events.emit('matcap:snapshot');
}, debounceDelay);

export { emitSnapshot };
