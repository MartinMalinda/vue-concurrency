import { defineConfig } from 'vitepress'


export default defineConfig({
  title: "🚦vue-concurrency",
  description:
    "A library for encapsulating asynchronous operations and managing concurrency",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/introduction/" },
      { text: "GitHub", link: "https://github.com/MartinMalinda/vue-concurrency/" },
    ],
    sidebar: {
      '/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Introduction', link: '/introduction/' },
            { text: 'Task Instances', link: '/tasks-instances/' },
            { text: 'Installation', link: '/installation/' },
          ],
        },
        {
          text: 'Practice',
          items: [
            { text: 'Performing Tasks', link: '/performing-tasks/' },
            { text: 'Task State', link: '/task-state/' },
            { text: 'Composing Tasks', link: '/composing-tasks/' },
            { text: 'Cancellation', link: '/cancellation/' },
            { text: 'Managing Concurrency', link: '/managing-concurrency/' },
            { text: 'Handling Errors', link: '/handling-errors/' },
            { text: 'Testing', link: '/testing/' },
            { text: 'TypeScript Support', link: '/typescript-support/' },
            { text: 'SSR Support', link: '/ssr-support/' },
          ],
        },
        {
          text: 'Examples',
          items: [
            { text: 'Loading States', link: '/examples/loading-states/' },
            { text: 'Autocomplete', link: '/examples/autocomplete/' },
            { text: 'Store', link: '/examples/store/' },
            // Add other examples here as needed
          ],
        },
        {
          text: 'API Overview',
          items: [
            { text: 'Use Task', link: '/api-overview/use-task/' },
            { text: 'Task Instance', link: '/api-overview/task-instance/' },
            { text: 'Other', link: '/api-overview/other/' },
            // { text: 'SSR Utils', link: '/api-overview/ssr-utils/' },
          ],
        },
      ],
    },
  },
});
