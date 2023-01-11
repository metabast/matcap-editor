const acceptedFileTypes = ['glb'];

function promiseReader( file: File ){
    return new Promise((resolve, reject ) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            resolve(reader.result);
        }, { once: true });
        reader.readAsBinaryString(file);
    });
}

const DroppedFileManager = {
    onDrop: (event: DragEvent) =>{
        event.preventDefault();
        const files = event.dataTransfer?.files;
        const promises = [];
        if (files) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileExt = file.name.slice(file.name.lastIndexOf('.')+1);
                if (acceptedFileTypes.indexOf(fileExt) !== -1) {
                    promises.push(promiseReader(file));
                }
            }
            if(promises.length > 0){
                Promise.all(promises).then((results) => {
                    console.log(results);
                });
            }
        }
    },
};

export default DroppedFileManager;