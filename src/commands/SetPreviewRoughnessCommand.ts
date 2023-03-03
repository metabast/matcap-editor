import { Command } from '@/commons/Command';
import events, { emitSnapshot } from '@/commons/Events';
import type Editor from '@/Editor';
import type { Pane } from 'tweakpane';
import type { ValuesCommand, ValuesPaneCtrl } from '@/ts/types/PanesTypes';
import type MatcapPreviewWorld from '@/matcapPreview/MatcapPreviewWorld';
import { matcapPreviewStore } from '@/stores/matcapPreviewStore';
import { computed } from 'vue';

const store = computed(() => matcapPreviewStore());

type SelectedTypes = number;
class SetPreviewRoughnessCommand extends Command {
    private world: MatcapPreviewWorld;

    private parameters: ValuesCommand;

    private pane: Pane;

    private paneCtrl: ValuesPaneCtrl;
    private paneMetalnessCtrl: ValuesPaneCtrl;

    constructor(editor: Editor, parameters: ValuesCommand, pane: Pane, paneCtrl: ValuesPaneCtrl, paneMetalnessCtrl: ValuesPaneCtrl) {
        super(editor);
        this.type = 'SetPreviewRoughnessCommand';
        this.name = 'Set Preview Roughness';
        this.updatable = true;
        this.world = this.editor.matcapPreviewWorld;
        this.parameters = parameters;
        this.pane = pane;
        this.paneCtrl = paneCtrl;
        this.paneMetalnessCtrl = paneMetalnessCtrl;
    }

    execute(): void {
        this.apply(this.parameters.value as SelectedTypes);
        emitSnapshot();
    }

    undo(): void {
        this.apply(this.parameters.oldValue as SelectedTypes);
        emitSnapshot();
    }

    apply(value: number): void {
        this.paneCtrl.history = false;
        this.paneMetalnessCtrl.history = false;

        store.value.roughness = value;
        store.value.metalness = 1 - value;

        this.paneCtrl.value = value;
        this.paneMetalnessCtrl.value = 1 - value;

        this.pane.refresh();

        this.paneMetalnessCtrl.history = true;
        this.paneCtrl.history = true;

        events.emit('object:roughness:update');
        events.emit('object:metalness:update');
    }
}

export { SetPreviewRoughnessCommand };
