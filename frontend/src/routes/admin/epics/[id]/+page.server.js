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
export async function load({ cookies,params }) {
    const notSafeCookie = cookies.get("access_token");
	const cookie = encodeURIComponent(notSafeCookie);
	var project, epic, employees;
    var tasks = []
	// Get project data from DB
	var response = await axios.get(`/epic/${params.id}`, {
		headers: { Cookie: "access_token=" + cookie }
	});
	if (response.data.success === true) {
		epic = response.data.epic;
        tasks = response.data.epic.tasks;
	}

	// Get all employees managed by the leader
	var response = await axios.get(`/employee-get-all`, {
		headers: { Cookie: "access_token=" + cookie }
	});
	if (response.data.success === true) {
		employees = response.data.employees;
	}
	var response = await axios.get(`/project/${epic.project}`, {
		headers: { Cookie: "access_token=" + cookie }
	});
	if (response.data.success === true) {
		project = response.data.project;
	}
	
    return {
		props: {
			epic: epic,
			epicID: params.id,
            tasks: tasks,
			employees: employees,
			project: project
		}
	};
}