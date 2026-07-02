import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          DEFAULT: "#0F1B3D",
          950: "#0A1230",
          900: "#0F1B3D",
          800: "#182755",
          700: "#22346D",
        },
        mint: {
          DEFAULT: "#44F5BA",
          500: "#44F5BA",
          600: "#2DD4A0",
        },
        coral: {
          DEFAULT: "#FF8A65",
          500: "#FF8A65",
          600: "#F26A45",
        },
        info: "#3D4FE8",
        ink: "#0F1B3D",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(15,27,61,0.35)",
        glow: "0 0 40px rgba(68,245,186,0.35)",
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(ellipse at top, rgba(68,245,186,0.15), transparent 60%), radial-gradient(ellipse at bottom right, rgba(61,79,232,0.25), transparent 60%), linear-gradient(180deg, #0A1230 0%, #0F1B3D 100%)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
