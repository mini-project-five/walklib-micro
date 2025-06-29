import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../components/pages/Index.vue'),
    },
    {
      path: '/users',
      component: () => import('../components/ui/UserGrid.vue'),
    },
    {
      path: '/points',
      component: () => import('../components/ui/PointGrid.vue'),
    },
    {
      path: '/pointLists',
      component: () => import('../components/PointListView.vue'),
    },
    {
      path: '/subscriptions',
      component: () => import('../components/ui/SubscriptionGrid.vue'),
    },
    {
      path: '/books',
      component: () => import('../components/ui/BookGrid.vue'),
    },
    {
      path: '/bookLists',
      component: () => import('../components/BookListView.vue'),
    },
    {
      path: '/authors',
      component: () => import('../components/ui/AuthorGrid.vue'),
    },
    {
      path: '/authorManagements',
      component: () => import('../components/ui/AuthorManagementGrid.vue'),
    },
    {
      path: '/authorManagementViews',
      component: () => import('../components/AuthorManagementViewView.vue'),
    },
    {
      path: '/manuscripts',
      component: () => import('../components/ui/ManuscriptGrid.vue'),
    },
    {
      path: '/manuscriptLists',
      component: () => import('../components/ManuscriptListView.vue'),
    },
    {
      path: '/ais',
      component: () => import('../components/ui/AiGrid.vue'),
    },
  ],
})

export default router;
