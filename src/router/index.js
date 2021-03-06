import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '../components/Welcome'
import Users from '../components/user/Users'
import Rights from '../components/perm/Rights'
import Roles from '../components/perm/Roles'
import Cate from '../components/goods/Cate'
import Params from '../components/goods/Params'
import GoodsList from '../components/goods/GoodsList'
import Add from '../components/goods/Add'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home, redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: Add }
    ]}
]

const router = new VueRouter({
  routes
})

/**
 * 挂载路由导航首位
 * @to    去哪个路径
 * @from  从哪个路径过来
 * @next  回调函数。next()放行到to，next(otherPath)：强制放行到otherPath
 */
router.beforeEach((to, from, next) => {
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token');
  if (tokenStr) {
    if (to.path === '/login') {
      // 已登录用户不能方位登录页
      return next('/home');
    } else {
      // 已登录用户对于其他页面，均放行
      return next();
    }
  } else {
    if (to.path === '/login') {
      // 未登录用户访问登录页面放行
      return next();
    } else {
      // 未登录用户访问其他页面，强制跳转到登录页面
      return next('/login');
    }
  }
})

export default router
