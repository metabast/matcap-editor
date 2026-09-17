import { Command } from '@/commons/Command';
import events, { emitSnapshot } from '@/commons/Events';
import { matcapPreviewStore } from '@/stores/matcapPreviewStore';
import { computed } from 'vue';
import type SceneService from '@/services/SceneService';
import type { Pane } from 'tweakpane';
import type { ValuesCommand, ValuesPaneCtrl } from '@/ts/types/PanesTypes';
import type MatcapPreviewWorld from '@/matcapPreview/MatcapPreviewWorld';

const store = computed(() => matcapPreviewStore());

type SelectedTypes = number;
class SetPreviewRoughnessCommand extends Command {
    private world: MatcapPreviewWorld;

    private parameters: ValuesCommand;

    private pane: Pane;

    private paneCtrl: ValuesPaneCtrl;
    private paneMetalnessCtrl: ValuesPaneCtrl;

    constructor(
        scene: SceneService,
        parameters: ValuesCommand,
        pane: Pane,
        paneCtrl: ValuesPaneCtrl,
        paneMetalnessCtrl: ValuesPaneCtrl,
    ) {
        super(scene);
        this.type = 'SetPreviewRoughnessCommand';
        this.name = 'Set Preview Roughness';
        this.updatable = true;
        this.world = this.scene.previewWorld;
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
