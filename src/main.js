import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入axios作网络请求
import axios from 'axios'
// 导入树形表格组件
import TreeTable from 'vue-table-with-tree-grid'

// 配置api的根路径
axios.defaults.baseURL = 'http://www.ysqorz.top:8888/api/private/v1/'
// 在挂载之前，注册请求拦截器，往请求头中注入token
axios.interceptors.request.use(config => {
  // console.log(config);
  const tokenStr = window.sessionStorage.getItem('token');
  if (tokenStr) {
    config.headers.Authorization = tokenStr
  }
  // 必须return config
  return config;
})
// 在挂载之前，注册响应拦截器，如果响应不成功，提示错误信息
// axios.interceptors.response.use(response => {
//   if (response.data.meta.status !== 200) {
//     Message.error(response.data.meta.msg);
//   }
//   // 不要忘了返回
//   return response;
// })


// 挂载到vue中，替换vue原本的网络请求工具
Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
