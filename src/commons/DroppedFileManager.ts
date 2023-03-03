import { EVENT_FILES_DROPPED } from './Constants';
import events from './Events';

const acceptedFileTypes = ['glb'];

function promiseReader(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            resolve(reader.result as string);
        }, { once: true });
        reader.readAsBinaryString(file);
    });
}

const DroppedFileManager = {
    onDrop: (event: DragEvent) => {
        event.preventDefault();
        const files = event.dataTransfer?.files;
        events.emit(EVENT_FILES_DROPPED, files);
    },
};

export default DroppedFileManager;