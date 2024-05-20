import { userStore } from "$lib/stores/userStore.js";
import axios from "axios";
axios.defaults.baseURL = "http://localhost:8080";
axios.interceptors.request.use(
	(config) => {
		config.withCredentials = true;
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export async function handle({ event, resolve }) {
	// Automatically authenticate user at login page
	if (event.url.pathname === "/") {
		return await resolve(event);
	}

	// Get the cookie from the request and encode it to URL safe format
	const notSafeCookie = event.cookies.get("access_token");
	const cookies = encodeURIComponent(notSafeCookie);

	try {
		// Check if user is authorized
		const response = await axios.get("/isAuthorized", {
			headers: {
				Cookie: "access_token=" + cookies
			}
		});
		if (
			response.status === 200 &&
			response.data !== null &&
			(await response.data.success) === true &&
			(await response.data.message) === "Authorized"
		) {
			// Set user's role in the userStore
			userStore.set(await response.data.currentUser);
			// if (event.url.pathname.startsWith("/admin")) {
			// 	if (response.data.currentUser.authorization === "Admin" || "admin") {
			// 		return await resolve(event);
			// 	} else {

			// 	}
			// }
			return await resolve(event);
		} else {
			return new Response(null, {
				status: 302,
				headers: {
					Location: "/"
				}
			});
		}
	} catch (error) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/"
			}
		});
	}
}
