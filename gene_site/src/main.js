import { createApp } from 'vue';
import App from './App.vue';
import zingchartVue from 'zingchart-vue';
import 'tailwindcss/tailwind.css'

const app = createApp(App);
app.component('zingchartVue', zingchartVue);
app.mount('#app');
