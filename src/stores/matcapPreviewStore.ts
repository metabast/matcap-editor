import { defineStore } from 'pinia';

export const matcapPreviewStore = defineStore('counter', {
    state: () => {
        return {
            power: 1,
            roughness: 0,
            metalness: 1,
            showGrid: false,
        };
    },
    actions: {
    },
});