import { createRouter, createWebHistory } from 'vue-router'
import MainView from '@/views/MainView.vue'
import SignInView from "@/views/SignInView.vue";
import UserManage from "@/components/UserManage.vue";
import QuestionnaireManage from "@/components/QuestionnaireManage.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '',
      name: 'main',
      meta: {
        auth: true
      },
      redirect: '/user-manage',
      component: MainView,
      children: [
        {
          path: 'user-manage',
          name: 'user-manage',
          component: UserManage
        },
        {
          path: 'questionnaire-manage',
          name: 'questionnaire manage',
          component: QuestionnaireManage
        }
      ]
    },
    {
      path: '/sign-in',
      name: 'sign-in',
      component: SignInView
    }
  ]
})

router.beforeEach((to, from, next)=>{
  if (to.meta.auth && localStorage.getItem('token') === null){
    next({
      path: '/sign-in',
      query: {
        redirect: to.fullPath
      },
    })
  }else {
    next()
  }
})

export default router
