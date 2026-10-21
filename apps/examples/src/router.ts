import { createRouter, createWebHistory } from "vue-router";
import ExampleView from "./views/ExampleView";
import GalleryView from "./views/GalleryView";
import HomeView from "./views/HomeView";

/**
 * Routes: the landing page, the examples overview, guides, the API reference, and one page per
 * example. Guides and the reference load on demand: they carry the Markdown
 * renderer and the generated reference.
 */
export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: HomeView, meta: { wide: true } },
    { path: "/examples", name: "examples", component: GalleryView },
    {
      path: "/guide/:slug",
      name: "guide",
      component: () => import("./views/GuideView"),
      props: true,
    },
    { path: "/api", name: "api", component: () => import("./views/ApiView") },
    { path: "/:slug", name: "example", component: ExampleView, props: true },
  ],
  scrollBehavior: (to, _from, saved) => {
    if (saved) return saved;
    if (to.hash) return { el: to.hash, top: 80 };
    return { top: 0 };
  },
});
