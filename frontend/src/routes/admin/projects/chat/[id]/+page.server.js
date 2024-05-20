import { get } from "svelte/store";
import { userStore } from "$lib/stores/userStore.js";
import axios from "axios";
import { error } from "@sveltejs/kit";
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
	var project,
		allowedAccounts = [], messages = [];
	// Handle cookies (required)
	const notSafeCookie = cookies.get("access_token");
	const cookie = encodeURIComponent(notSafeCookie);
	// Get project data from DB
	var response = await axios.get(`/project/${params.id}`, {
		headers: { Cookie: "access_token=" + cookie }
	});
	if (response.data.success === true) {
		project = response.data.project;
	}

	allowedAccounts.push(project.leader[0]._id);
	response = await axios.get(`/get-employee-by-project/${project._id}`, {
		headers: { Cookie: "access_token=" + cookie }
	});
	if (response.data.success === true) {
		response.data.employees.forEach((employee) => {
			allowedAccounts.push(employee.members);
		});
	}

	const currentUser = get(userStore);

	if (!allowedAccounts.includes(currentUser._id)) {
		throw error(401, {
			message: "You are unauthorized to access this resource."
		});
	}

	// Get all messages from DB
	response = await axios.get(`/get-message-by-project/${project._id}`, {
		headers: { Cookie: "access_token=" + cookie }
	});
	if (response.data.success === true) {
		messages = response.data.message;
	}

	return {
		props: {
			currentUser: currentUser,
			allowedAccounts: allowedAccounts,
			project: project,
			messages: messages
		}
	};
}
