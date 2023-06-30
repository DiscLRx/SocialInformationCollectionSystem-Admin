import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import dayjs from "dayjs";
import antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

const app = createApp(App)

app.use(dayjs);
app.use(antd);
app.use(router);

app.mount('#app')
