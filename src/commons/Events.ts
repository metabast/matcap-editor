import { createNanoEvents, Emitter } from 'nanoevents';

const emitter = createNanoEvents();
export default {
    on(event: string, callback: () => void): void {
        emitter.on(event, callback);
    },
    emit(event: string, data?: object): void {
        emitter.emit(event, data);
    },
    getNewEmitter(): Emitter {
        return createNanoEvents();
    },
};
