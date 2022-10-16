<script lang="ts">
    import { Gui } from 'uil';
    import { MatcapEditorStore, type IMatcapEditorStore } from 'src/store';
    import events, { emitSnapshot } from 'src/commons/Events';
    import { debounce, throttle } from 'src/commons/Utils';
    import type MatcapEditorContent from 'src/matcapEditor/MatcapEditorContent';
    import {
        SetSphereMaterialParamsCommand,
        type SphereMaterialPaneCtrl,
    } from 'src/commands/SetSphereMaterialParamsCommand';
    import { onMount } from 'svelte';
    import type { RootApi } from 'tweakpane/dist/types/blade/root/api/root';
    import { Pane } from 'tweakpane';
    import type { FolderApi } from '@tweakpane/core';
    import { Color } from 'three';
    import {
        SetMaterialColorCommand,
        type MaterialColorPaneCtrl,
    } from 'src/commands/SetMaterialColorCommand';

    let store: IMatcapEditorStore;
    MatcapEditorStore.subscribe((newStore) => {
        store = newStore;
    });
    let materialFolder: FolderApi;
    let pane: Pane;
    onMount(() => {
        pane = new Pane({
            container: document.querySelector('.matcap-editor-pane'),
        });

        materialFolder = pane.addFolder({
            title: 'Material',
        });
    });

    const gui = new Gui({
        css: `
            top: 202px;
            right: 0px;
        `,
        w: 200,
    });

    let sizes = store.sizes.exportRatios.map(
        (value) => value * store.sizes.exportDefault,
    );

    gui.add('grid', {
        name: '',
        values: sizes,
        selectable: true,
        value: store.sizes.exportDefault,
    }).onChange((value) => {
        store.sizes.exportRatio = value / store.sizes.exportDefault;
    });

    gui.add('button', { name: 'export png' }).onChange(() => {
        events.emit('matcap:export:png', { exported: true });
    });

    gui.add('button', { name: 'generate' }).onChange(() => {
        events.emit('matcap:generate', { exported: true });
    });

    gui.add(store.create, 'front');

    gui.add('grid', {
        values: ['Area', 'Point', 'Spot'],
        selectable: true,
        value: store.create.lightType,
    }).onChange((value) => {
        store.create.lightType = value;
    });

    let grMat = gui.add('group', { name: 'Material', h: 30 });

    let grAmbiant = gui.add('group', { name: 'Ambiant', h: 30 });

    const colorObj = { ambiantColor: 0xffffff };
    grAmbiant.add(colorObj, 'ambiantColor', { ctype: 'hex' }).onChange(() => {
        store.ambiant.color.setHex(colorObj.ambiantColor);
        events.emit('matcap:ambiant:update');
    });

    grAmbiant
        .add(store.ambiant, 'intensity', {
            name: 'ambiant',
            min: 0,
            max: 2,
            step: 0.01,
            precision: 2,
        })
        .onChange((value) => {
            events.emit('matcap:ambiant:update');
        });

    let grCreate = gui.add('group', { name: 'Create', h: 30 });
    grCreate.add(store.create, 'distance', {
        min: 0,
        max: 10,
        step: 0.1,
    });
    grCreate.add(store.create, 'intensity', {
        min: 0,
        max: 10,
        step: 0.1,
    });
    grCreate.add(store.create, 'color', { ctype: 'hex' });

    let gr = gui.add('group', { name: 'current light', h: 30 });

    let currentLight = null;

    const updateCurrentLight = (lightModel) => {
        if (currentLight === lightModel) {
            return;
        }
        currentLight = lightModel;
        gr.clear();

        gr.add(lightModel.light, 'intensity', {
            min: 0,
            max: 10,
            step: 0.01,
        }).onChange(emitSnapshot);
        gr.add(lightModel, 'distance', {
            min: 0,
            max: 10,
            step: 0.01,
        }).onChange(() => {
            events.emit('matcap:light:update:distance', lightModel);
        });
        let colorObj = {
            color: lightModel.light.color.getHex(),
        };
        gr.add(colorObj, 'color', { ctype: 'hex' }).onChange(() => {
            lightModel.light.color.setHex(colorObj.color);
            emitSnapshot();
        });
        if (lightModel.light.type === 'PointLight') {
            gr.add(lightModel.light, 'distance', {
                min: 0,
                max: 10,
                step: 0.01,
            }).onChange(emitSnapshot);
            gr.add(lightModel.light, 'decay', {
                min: 0,
                max: 100,
                step: 0.01,
            }).onChange(emitSnapshot);
        }
        if (lightModel.light.type === 'RectAreaLight') {
            gr.add(lightModel, 'lookAtTarget');

            gr.add(lightModel.light, 'width', {
                min: 0,
                max: 100,
                step: 0.01,
            }).onChange(emitSnapshot);
            gr.add(lightModel.light, 'height', {
                min: 0,
                max: 100,
                step: 0.01,
            }).onChange(emitSnapshot);

            gr.add('number', {
                name: 'target',
                value: lightModel.positionTarget.toArray(),
                step: 0.01,
                h: 25,
            }).onChange((value) => {
                lightModel.positionTargetX = value[0];
                lightModel.positionTargetY = value[1];
                lightModel.positionTargetZ = value[2];
                emitSnapshot();
            });
        }
        if (lightModel.light.type === 'SpotLight') {
            gr.add(lightModel.light, 'angle', {
                min: 0,
                max: Math.PI / 2,
                step: 0.001,
                precision: 3,
            }).onChange(emitSnapshot);

            gr.add(lightModel.light, 'penumbra', {
                min: 0,
                max: 1,
                step: 0.001,
                precision: 3,
            }).onChange(emitSnapshot);

            gr.add('number', {
                name: 'target',
                value: [0, 0, 0],
                step: 0.01,
                h: 25,
            }).onChange((value) => {
                console.log(value);
                lightModel.positionTargetX = value[0];
                lightModel.positionTargetY = value[1];
                lightModel.positionTargetZ = value[2];
                emitSnapshot();
            });
        }

        gr.add('button', { name: 'delete', title: 'delete' }).onChange(() => {
            events.emit('matcap:light:delete', lightModel);
            gr.clear();
        });

        gr.open();
    };

    events.on('matcap:light:update:current', updateCurrentLight);

    events.on('matcap:content:ready', (content: MatcapEditorContent) => {
        const oldValue = {
            roughness: Number(content.sphereRenderMaterial.roughness),
            metalness: Number(content.sphereRenderMaterial.metalness),
            color: `#${content.sphereRenderMaterial.color.getHexString()}`,
        };

        const roughnessCtrl: SphereMaterialPaneCtrl = {
            value: Number(content.sphereRenderMaterial.roughness),
            oldValue: Number(content.sphereRenderMaterial.roughness),
            history: true,
        };
        materialFolder
            .addInput(content.sphereRenderMaterial, 'roughness', {
                min: 0,
                max: 1,
                step: 0.01,
            })
            .on('change', (event) => {
                if (event.last && roughnessCtrl.history) {
                    content.world.editor.execute(
                        new SetSphereMaterialParamsCommand(
                            content.world.editor,
                            {
                                name: 'roughness',
                                value: content.sphereRenderMaterial.roughness,
                                oldValue: Number(oldValue.roughness),
                            },
                            pane,
                            roughnessCtrl,
                        ),
                        'update material roughness',
                    );
                    oldValue.roughness = Number(
                        content.sphereRenderMaterial.roughness,
                    );
                }
            });

        const metalnessCtrl: SphereMaterialPaneCtrl = {
            value: Number(content.sphereRenderMaterial.metalness),
            oldValue: Number(content.sphereRenderMaterial.metalness),
            history: true,
        };
        materialFolder
            .addInput(content.sphereRenderMaterial, 'metalness', {
                min: 0,
                max: 1,
                step: 0.01,
            })
            .on('change', (event) => {
                if (event.last && metalnessCtrl.history) {
                    content.world.editor.execute(
                        new SetSphereMaterialParamsCommand(
                            content.world.editor,
                            {
                                name: 'metalness',
                                value: content.sphereRenderMaterial.metalness,
                                oldValue: Number(oldValue.roughness),
                            },
                            pane,
                            metalnessCtrl,
                        ),
                        'update material metalness',
                    );
                    oldValue.metalness = Number(
                        content.sphereRenderMaterial.metalness,
                    );
                }
            });

        let colorObj: MaterialColorPaneCtrl = {
            value: `#${content.sphereRenderMaterial.color.getHexString()}`,
            oldValue: content.sphereRenderMaterial.color.getHex(),
            history: true,
        };
        materialFolder.addInput(colorObj, 'value').on('change', (event) => {
            content.sphereRenderMaterial.color.set(colorObj.value);
            if (event.last && colorObj.history) {
                content.world.editor.execute(
                    new SetMaterialColorCommand(
                        content.world.editor,
                        {
                            name: 'color',
                            value: content.sphereRenderMaterial.color.getHex(),
                            oldValue: colorObj.oldValue,
                        },
                        content.sphereRenderMaterial,
                        pane,
                        colorObj,
                    ),
                    'update material color',
                );
                colorObj.oldValue = new Color(colorObj.value).getHex();
            }
        });
    });
</script>

<div class="matcap-editor-pane" />

<style>
    .matcap-editor-pane {
        position: fixed;
        right: 200px;
        top: 0;
        z-index: 1;
        user-select: none;
    }
</style>
