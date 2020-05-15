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
        children: ["/introduction/", "/benefits/"],
      },
      {
        title: "Practice",
        collapsable: false,
        children: [
          "/performing-tasks/",
          "/task-state/",
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
