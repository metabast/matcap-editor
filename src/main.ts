import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import * as THREE from 'three';

window.THREE = THREE; // Expose THREE to APP Scripts and Console

import './assets/main.css';

const app = createApp(App);

app.use(createPinia());


app.mount('#app');
