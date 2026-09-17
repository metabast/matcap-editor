import type Editor from '@/Editor';
import type MatcapEditorContent from '@/matcapEditor/MatcapEditorContent';
import type { Pane, TabPageApi } from 'tweakpane';

/**
 * Fields are filled by `initialize()`, not by the constructor: the subclasses are
 * singletons built before the Tweakpane objects they wrap exist. Hence the
 * definite assignment assertions below.
 */
class PaneFolderControler {
    protected _pane!: Pane;
    protected _paneFolder!: TabPageApi;
    protected _editor!: Editor;
    protected _mapcapEditorContent!: MatcapEditorContent;
    initialize(pane: Pane, paneFolder: TabPageApi, editor: Editor) {
        this._pane = pane;
        this._paneFolder = paneFolder;

        this._editor = editor;
        this._mapcapEditorContent = this._editor.matcapEditorWorld.content;

        this._generate();
    }

    protected _generate() {
        if (!this._paneFolder) return;
    }
}

export default PaneFolderControler;
