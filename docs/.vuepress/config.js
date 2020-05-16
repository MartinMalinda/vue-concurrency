// .vuepress/config.js
module.exports = {
  title: "🚦vue-concurrency",
  description:
    "A library for encapsulating asynchronous operations and managing concurrency",
  themeConfig: {
    repo: "martinmalinda/vue-concurrency",
    theme: "@vuepress/vue",
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/introduction/" },
    ],
    sidebar: [
      {
        title: "Theory",
        collapsable: false,
        children: ["/introduction/", "/tasks-instances/"],
      },
      {
        title: "Practice",
        collapsable: false,
        children: [
          "/task-state/",
          "/performing-tasks/",
          "/cancellation/",
          "/managing-concurrency/",
          "/awaiting-tasks/",
          "/handling-errors/",
          "/testing/",
          "/typescript-support/",
        ],
      },
      {
        title: "API overview",
        collapsable: false,
      },
    ],
  },
  plugins: [
    [
      "vuepress-plugin-typescript",
      {
        tsLoaderOptions: {
          // All options of ts-loader
        },
      },
    ],
  ],
};
