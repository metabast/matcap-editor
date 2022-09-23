<script lang="ts">
    import { MatcapEditorStore, type IMatcapEditorStore } from 'src/store';
    import events from 'src/commons/Events';
    import { Light } from 'three';
    import type LightModel from 'src/matcapEditor/LightModel';
    import MatcapProperties from './MatcapProperties.svelte';

    let getCSSPosition;
    let getMatcapLightsStyle;

    if (import.meta.hot) {
        import.meta.hot.dispose((data) => {
            import.meta.hot.invalidate();
        });
    }
    let store: IMatcapEditorStore;
    MatcapEditorStore.subscribe((newStore) => {
        store = newStore;
    });

    let currentLight = null;

    const lightAdded = (lightModel: LightModel): void => {
        currentLight = lightModel;
        events.emit('matcap:light:update:current', lightModel);
        store.lights.push(lightModel);
    };

    $: getMatcapLightsStyle = () => `
            width: ${store.sizes.view}px;
            height: ${store.sizes.view}px;
        `;

    $: getCSSPosition = (lightModel: LightModel) => `
            left:${lightModel.screenPosition.x / store.ratio - 6}px;
            top:${lightModel.screenPosition.y / store.ratio - 6}px;
            border-color:${
                lightModel.light.uuid === currentLight.light.uuid
                    ? '#00ffff'
                    : '#ffffff'
            };
        `;

    const onMouseDown = (event, lightModel): void => {
        store.isUILightVisible = false;
        currentLight = lightModel;
        events.emit('matcap:light:update:current', lightModel);
        events.emit('matcap:light:startMoving', lightModel);
    };

    events.on('matcap:editor:light:added', lightAdded);
</script>

<div>
    {#if store.isUILightVisible}
        <div id="matcapLights" style={getMatcapLightsStyle()}>
            {#each store.lights as light, index}
                <div
                    class="light"
                    style={getCSSPosition(light)}
                    on:mousedown={(event) => onMouseDown(event, light)}
                />
            {/each}
        </div>
    {/if}
    <MatcapProperties />
</div>

<style>
    #matcapLights {
        position: absolute;
        top: 0;
        right: 0;
        pointer-events: none;
    }
    .light {
        position: absolute;
        background-color: black;
        width: 10px;
        height: 10px;
        border-radius: 10px;
        touch-action: none;
        pointer-events: all;
        border-width: 1px;
        border-style: solid;
        mix-blend-mode: difference;
        cursor: pointer;
    }
    .light:hover {
        background-color: rgba(255, 255, 255, 0.233);
    }
</style>
