import Editor from '@/Editor';
import type MatcapEditorContent from '@/matcapEditor/MatcapEditorContent';
import type { Pane, TabPageApi } from 'tweakpane';

class PaneFolderControler {
    protected _pane: Pane;
    protected _paneFolder: TabPageApi;
    protected _editor: Editor;
    protected _mapcapEditorContent: MatcapEditorContent;
    initialize(pane: Pane, paneFolder: TabPageApi) {
        this._pane = pane;
        this._paneFolder = paneFolder;

        this._editor = Editor.instance;
        this._mapcapEditorContent = this._editor.matcapEditorWorld.content;

        this._generate();
    }

    protected _generate() {
        if (!this._paneFolder) return;
    }

}

export default PaneFolderControler;