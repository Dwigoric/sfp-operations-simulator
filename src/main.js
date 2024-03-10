// Import packages
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import App from './App.vue'
import router from './router'

// Import stylesheets
import './assets/main.css'
import 'vuetify/lib/styles/main.css'

// Build the app
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(
    createVuetify({
        icons: {
            defaultSet: 'mdi',
            aliases,
            sets: {
                mdi
            }
        }
    })
)

app.mount('#app')
