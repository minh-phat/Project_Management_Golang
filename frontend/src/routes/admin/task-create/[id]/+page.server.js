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
	var leaderId, employees = [];

	// Get leader ID from epic ID
	var response = await axios.get(`/get-leader-for-epic/${params.id}`, {
		headers: { Cookie: "access_token=" + cookie }
	});
	if (response.data.success === true) {
		leaderId = response.data.leader;
	}

	// Get all employees managed by the leader
	response = await axios.get(`/get-employee-by-manager/${leaderId}`, {
		headers: { Cookie: "access_token=" + cookie }
	});
	if (response.data.success === true) {
		employees = response.data.employees;
	}

	var project, epic;
	// Get project data from DB
	response = await axios.get(`/epic/${params.id}`, {
		headers: { Cookie: "access_token=" + cookie }
	});
	if (response.data.success === true) {
		epic = response.data.epic;
	}

	response = await axios.get(`/project/${epic.project}`, {
		headers: { Cookie: "access_token=" + cookie }
	});
	if (response.data.success === true) {
		project = response.data.project;
	}

	return {
		employees: employees,
		EpicID: params.id,
		epic: epic,
		project: project,
	};
}