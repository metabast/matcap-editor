<script lang="ts">
    import { Gui } from 'uil';
    import { MatcapEditorStore, type IMatcapEditorStore } from 'src/store';
    import events, { emitSnapshot } from 'src/commons/Events';
    import { debounce, throttle } from 'src/commons/Utils';

    let store: IMatcapEditorStore;
    MatcapEditorStore.subscribe((newStore) => {
        store = newStore;
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
            store.lights.splice(store.lights.indexOf(lightModel), 1);
            events.emit('matcap:light:delete', lightModel);
            gr.clear();
        });

        gr.open();
    };

    events.on('matcap:light:update:current', updateCurrentLight);

    events.on('matcap:content:ready', (content) => {
        grMat
            .add(content.sphereRenderMaterial, 'roughness', {
                min: 0,
                max: 1,
                step: 0.01,
            })
            .onChange(emitSnapshot)
            .listen();
        grMat
            .add(content.sphereRenderMaterial, 'metalness', {
                min: 0,
                max: 1,
                step: 0.01,
            })
            .onChange(emitSnapshot)
            .listen();
        let colorObj = {
            color: content.sphereRenderMaterial.specularColor.getHex(),
            specularColor: content.sphereRenderMaterial.specularColor.getHex(),
        };

        grMat.add(colorObj, 'color', { ctype: 'hex' }).onChange(() => {
            content.sphereRenderMaterial.color.setHex(colorObj.color);
            emitSnapshot();
        });
    });
</script>
