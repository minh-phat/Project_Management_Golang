import { get } from "svelte/store";
import { userStore } from "$lib/stores/userStore.js";
import { error } from "@sveltejs/kit";
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

export async function load({ cookies, params }) {
	// Handle cookies (required)
	const notSafeCookie = cookies.get("access_token");
	const cookie = encodeURIComponent(notSafeCookie);

	var employee, authorization;

	// Get user from params
	var response = await axios.get(`/get-employee-detail/${params.id}`, {
		headers: { Cookie: "access_token=" + cookie }
	});
	if (response.data.success === true) {
		employee = response.data.employee;
	}

	// Get current user
	const currentUser = get(userStore);

	if (currentUser._id === employee._id) {
		// Get authorizations
		response = await axios.get(`/authorization-get-all`, {
			headers: { Cookie: "access_token=" + cookie }
		});
		if (response.data.success === true) {
			var authorizations = response.data.authorizations;
			authorization = authorizations.find(
				(auth) => auth.Id === employee.account.account_authorization_id
			);
		}
		employee.createdAt = new Date(employee.createdAt * 1000).toLocaleDateString("en-UK", {
			timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
		});

		return {
			authorization: authorization.LevelName,
			employee: employee,
			currentUser: currentUser
		};
	} else {
		throw error(401, {
			message: "You are unauthorized to access this resource."
		});
	}
}
