/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{html,js,svelte,ts}"],
	theme: {
		extend: {
			colors: {
				primary: {
					50: "#eff6ff",
					100: "#dbeafe",
					200: "#bfdbfe",
					300: "#93c5fd",
					400: "#60a5fa",
					500: "#3b82f6",
					600: "#2563eb",
					700: "#1d4ed8",
					800: "#1e40af",
					900: "#1e3a8a",
					950: "#172554"
				}
			}
		},
		fontFamily: {
			body: [
				"Lato",
				"ui-sans-serif",
				"system-ui",
				"-apple-system",
				"system-ui",
				"Segoe UI",
				"Roboto",
				"Helvetica Neue",
				"Arial",
				"Noto Sans",
				"sans-serif",
				"Apple Color Emoji",
				"Segoe UI Emoji",
				"Segoe UI Symbol",
				"Noto Color Emoji"
			],
			sans: [
				"Lato",
				"ui-sans-serif",
				"system-ui",
				"-apple-system",
				"system-ui",
				"Segoe UI",
				"Roboto",
				"Helvetica Neue",
				"Arial",
				"Noto Sans",
				"sans-serif",
				"Apple Color Emoji",
				"Segoe UI Emoji",
				"Segoe UI Symbol",
				"Noto Color Emoji"
			]
		}
	},
	plugins: [],
	darkMode: "media",

	//Huy
	daisyui: {
		themes: [
			{
				light: {
					"primary": '#0ae68d',
					"secondary": '#2AF6A2',
					"accent": '#07ab69',
					"neutral": '#2F3B6D',
					"base-100": '#f2f2f2',
					"info": '#00deff',
					"success": '#8cf988',
					"warning": '#d56800',
					"error": '#ff2764'
				},
				dark: {
					"primary": '#0ae68d',
					"secondary": '#2AF6A2',
					"accent": '#07ab69',
					"neutral": '#2F3B6D',
					"base-100": '#f2f2f2',
					"info": '#00deff',
					"success": '#8cf988',
					"warning": '#d56800',
					"error": '#ff2764'
				}
			}
		]
	},
	plugins: [require('@tailwindcss/typography'), require('daisyui')]
};
