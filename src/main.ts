import App from './App.vue';
import Editor from '@/Editor';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import * as THREE from 'three'; // Expose THREE to APP Scripts and Console

import './assets/main.css';

window.THREE = THREE;

const app = createApp(App);

app.use(createPinia());

app.mount('#app');

// Composition root: the worlds query their canvas from the DOM, so the editor
// can only be built once the app is mounted.
Editor.bootstrap();
