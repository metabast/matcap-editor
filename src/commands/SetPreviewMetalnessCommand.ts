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
class SetPreviewMetalnessCommand extends Command {
    private world: MatcapPreviewWorld;

    private parameters: ValuesCommand;

    private pane: Pane;

    private paneCtrl: ValuesPaneCtrl;
    private paneRoughnessCtrl: ValuesPaneCtrl;

    constructor(editor: Editor, parameters: ValuesCommand, pane: Pane, paneCtrl: ValuesPaneCtrl, paneRoughnessCtrl: ValuesPaneCtrl) {
        super(editor);
        this.type = 'SetPreviewMetalnessCommand';
        this.name = 'Set Preview Roughness';
        this.updatable = true;
        this.world = this.editor.matcapPreviewWorld;
        this.parameters = parameters;
        this.pane = pane;
        this.paneCtrl = paneCtrl;
        this.paneRoughnessCtrl = paneRoughnessCtrl;
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
        this.paneRoughnessCtrl.history = false;

        store.value.metalness = value;
        store.value.roughness = 1 - value;

        this.paneCtrl.value = value;
        this.paneRoughnessCtrl.value = 1 - value;

        this.pane.refresh();

        this.paneRoughnessCtrl.history = true;
        this.paneCtrl.history = true;

        events.emit('object:metalness:update');
        events.emit('object:roughness:update');
    }
}

export { SetPreviewMetalnessCommand };
