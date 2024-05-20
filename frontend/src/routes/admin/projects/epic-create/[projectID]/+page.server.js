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
	var project;

	var response = await axios.get(`/project/${params.projectID}`, {
		headers: { Cookie: "access_token=" + cookie }
	});
	if (response.data.success === true) {
		project = response.data.project;
	}
	
    return {
		props: {
			ProjectID: params.projectID,	
			Project: project
		}
	};
}