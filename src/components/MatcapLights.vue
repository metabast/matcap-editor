<template >
    <div id="matcapLights"
        :style="getMatcapLightsStyle()"
        v-if="store.isUILightVisible" 
    >
        <div v-for="light, index in store.lights"
            :key="index"
            :style="getCSSPosition(light as LightModel)"
            class="light"
            @mousedown="onMouseDown(light as LightModel)" >
        </div >
    </div >
    <MatcapProperties />
</template >

<script lang="ts" setup >
import events from '@/commons/Events';
import type LightModel from '@/matcapEditor/LightModel';
import { computed } from 'vue';
import { matcapEditorStore } from '@/stores/matcapEditorStore';
import MatcapProperties from './MatcapProperties.vue';

if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        import.meta?.hot?.invalidate();
    });
}

const store = computed(() => matcapEditorStore());
let currentLight: LightModel;

const lightAdded = (lightModel: LightModel): void => {
    currentLight = lightModel;
    events.emit('matcap:light:update:current', lightModel);
    store.value.addLight(lightModel);
};

function getMatcapLightsStyle() {
    return `
        width: ${store.value.sizes.view}px;
        height: ${store.value.sizes.view}px;
    `;
}

function getCSSPosition(lightModel: LightModel) {
    return `
        left:${lightModel.screenPosition.x / store.value.ratio - 6}px;
        top:${lightModel.screenPosition.y / store.value.ratio - 6}px;
        border-color:${lightModel.light.uuid === currentLight.light.uuid ? '#00ffff' : '#ffffff'};
    `;
}

const onMouseDown = (lightModel: LightModel): void => {
    store.value.isUILightVisible = false;
    currentLight = lightModel;
    events.emit('matcap:light:update:current', lightModel);
    events.emit('matcap:light:startMoving', lightModel);
};

events.on('matcap:ui:light:update:current', (lightModel: LightModel) => {
    currentLight = lightModel;
});

events.on('matcap:editor:light:added', lightAdded);
</script >