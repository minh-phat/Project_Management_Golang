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

//Get Id on link
export async function load({ cookies, params }) {
	// Handle cookies (required)
	const notSafeCookie = cookies.get("access_token");
	const cookie = encodeURIComponent(notSafeCookie);
	var project, epics, employees;
	// Get project data from DB
	var response = await axios.get(`/project/${params.id}`, {
		headers: { Cookie: "access_token=" + cookie }
	});
	if (response.data.success === true) {
		project = response.data.project;
	}

	// Get epics data from DB
	response = await axios.get(`/epic-for-project/${params.id}`, {
		headers: { Cookie: "access_token=" + cookie }
	});
	if (response.data.success === true) {
		epics = response.data.epics;
	}

	// Get all employees of manager from DB
	response = await axios.get(`/get-employee-by-manager/${project.leader[0]._id}`, {
		headers: { Cookie: "access_token=" + cookie }
	});
	if (response.data.success === true) {
		employees = response.data.employees;
	}

	return {
		props: {
			project: project,
			epics: epics,
			employees: employees
		}
	};
}
