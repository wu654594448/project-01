import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'

Vue.use(VueRouter)
// 123
const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login }
  ]
})

export default router
