import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/home.vue'
import Welcome from '../components/huanying.vue'
// import Users from '../components/u/Users.vue'
import Users from '../components/u/Userscopy.vue'
import Roles from '../components/quanxian/jiaose.vue'
import Rights from '../components/quanxian/er.vue'
// import Rights from '../components/quanxian/ercopy.vue'
import Categories from '../components/s/shangfen.vue'
import Goods from '../components/s/shangyi.vue'
import Fenl from '../components/s/fenlei.vue'
import Orders from '../components/ding/dingdan.vue'
import Reports from '../components/tongji/tongji.vue'
import Add from '../components/s/adadd.vue'

Vue.use(VueRouter)
// 123
// 234
const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Categories },
        { path: '/rights', component: Rights },
        { path: '/params', component: Fenl },
        { path: '/goods', component: Goods },
        { path: '/orders', component: Orders },
        { path: '/reports', component: Reports },
        { path: '/goods/add', component: Add }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
