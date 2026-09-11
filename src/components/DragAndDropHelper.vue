<script setup lang="ts">
import events from '@/commons/Events';
import { ref } from 'vue';

const isVisible = ref(false);
const defaultMsg = '*.json for project, *.glb for object';
const msg = ref(defaultMsg);
defineProps({
    isVisibleOver: {
        type: Boolean,
        default: false,
    },
});
events.on('show:dragNdrop', (payload) => {
    isVisible.value = true;
    msg.value = payload?.msg || defaultMsg;
    setTimeout(() => {
        isVisible.value = false;
    }, 2000);
});
</script>

<template>
    <div v-if="isVisible || isVisibleOver" id="dragNdropContainer">
        <div id="dragNdropHelper">
            <div class="bg">
                <div>Drag and drop your file here</div>
                <div>{{ msg }}</div>
            </div>
        </div>
    </div>
</template>

<style>
#dragNdropContainer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}
#dragNdropHelper {
    width: 100%;
    height: 100%;
    padding: 1rem;
}
#dragNdropHelper .bg {
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    height: 100%;
    border-radius: 0.4rem;
    background: rgba(86, 165, 255, 0.5);
}
</style>
