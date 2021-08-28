const colors = require("tailwindcss/colors");

/**
 * @type {import("tailwindcss/tailwind-config").TailwindConfig}
 */
module.exports = {
	mode: "jit",
	purge: ["./index.html", "./src/**/*.{ts,tsx}"],
	darkMode: false,
	theme: {
		fontFamily: {
			"sans": ["Inter var", "system-ui", "sans-serif"],
			"serif": ["Inter var", "system-ui", "sans-serif"],
		},
		colors: {
			transparent: "transparent",
			current: "currentColor",
			black: colors.black,
			white: colors.white,
			gray: colors.trueGray,
			green: colors.green,
			red: colors.rose,
			yellow: colors.amber,
		},
	},
	variants: {
		extend: {},
	},
	plugins: [],
};
