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
        console.log(event.dataTransfer);

        const files = event.dataTransfer?.files;
        events.emit(EVENT_FILES_DROPPED, files);
        // const promises: Promise<string>[] = [];
        // if (files) {
        //     for (let i = 0; i < files.length; i++) {
        //         const file = files[i];
        //         console.log(file);

        //         const fileExt = file.name.slice(file.name.lastIndexOf('.') + 1);
        //         if (acceptedFileTypes.indexOf(fileExt) !== -1) {
        //             promises.push(promiseReader(file));
        //         }
        //     }
        //     if (promises.length > 0) {
        //         Promise.all(promises).then((results) => {
        //             events.emit(EVENT_FILES_DROPPED, results);
        //         });
        //     }
        // }
    },
};

export default DroppedFileManager;