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
	const notSafeCookie = cookies.get("access_token");
	const cookie = encodeURIComponent(notSafeCookie);
	var epic;
		// project,
		// employees;
	var tasks = []
	// Get project data from DB
	var response = await axios.get(`/epic/${params.id}`, {
		headers: { Cookie: "access_token=" + cookie }
	});
	if (response.data.success === true) {
		epic = response.data.epic;
		tasks = response.data.epic.tasks;
	}

	return {
		props: {
			epic: epic,
			epicID: params.id,
			tasks: tasks
		}
	};
}