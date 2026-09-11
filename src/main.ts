import App from './App.vue';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import * as THREE from 'three'; // Expose THREE to APP Scripts and Console

import './assets/main.css';

window.THREE = THREE;

const app = createApp(App);

app.use(createPinia());

app.mount('#app');
