export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ambar: "#f5a31a", mor: "#6a2c9e", ros: "#e23d8b",
        bg: "var(--bg)", fg: "var(--fg)", card: "var(--card)", mut: "var(--mut)", line: "var(--line)",
      },
      fontFamily: { display: ["Bricolage Grotesque", "system-ui", "sans-serif"], ui: ["Bricolage Grotesque", "system-ui", "sans-serif"], sans: ["Newsreader", "Georgia", "serif"] },
    },
  },
};
