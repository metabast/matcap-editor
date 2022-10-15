import type { Command } from './Command';
import { debounce } from './commons/Utils';
import { History } from './history';
import type MatcapEditorWorld from './matcapEditor/MatcapEditorWorld';
import type MatcapPreviewWorld from './matcapPreview/MatcapPreviewWorld';

class Editor {
    private _history: History;

    public matcapEditorWorld: MatcapEditorWorld;

    public matcapPreviewWorld: MatcapPreviewWorld;

    constructor() {
        this._history = new History(this);
        document.addEventListener(
            'keydown',
            debounce((event: KeyboardEvent) => {
                switch (event.key.toLowerCase()) {
                    case 'z':
                        if (event.ctrlKey) {
                            event.preventDefault(); // Prevent browser specific hotkeys

                            if (event.shiftKey) {
                                this.redo();
                            } else {
                                this.undo();
                            }
                        }

                        break;

                    default:
                        break;
                }
            }, 100),
        );
    }

    execute(cmd: Command, optionalName: string) {
        this._history.execute(cmd, optionalName);
    }

    undo() {
        this._history.undo();
    }

    redo() {
        this._history.redo();
    }
}

export default Editor;
