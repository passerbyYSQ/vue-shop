import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// 错误使用：Vue.use(Message)
// 需要全局挂载，$message是自定义属性
Vue.prototype.$message = Message;
