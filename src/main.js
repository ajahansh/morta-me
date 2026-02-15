import { createApp } from 'vue'
import App from './App.vue'
import VueApexCharts from "vue3-apexcharts" // Added for global registration
import './style.css' // Created for Tailwind

const app = createApp(App)
app.use(VueApexCharts) // This makes the <apexchart> component available
app.mount('#app')
