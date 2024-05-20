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
export async function load({ cookies }) {
	// Handle cookies (required)
	const notSafeCookie = cookies.get("access_token");
	const cookie = encodeURIComponent(notSafeCookie);
	var authorizations, managers;

	var response = await axios.get("/authorization-get-all", {
		headers: { Cookie: "access_token=" + cookie }
	});
	authorizations = await response.data.authorizations;

	response = await axios.get("/get-employee-by-role/Director", {
		headers: { Cookie: "access_token=" + cookie }
	});
	managers = await response.data.employees;

	response = await axios.get("/get-employee-by-role/Manager", {
		headers: { Cookie: "access_token=" + cookie }
	});
	if (response.data.employees != null) {
		for (var i = 0; i < response.data.employees.length; i++) {
			if (managers != null) {
				managers.push(response.data.employees[i]);
			}
		}
	}

	return {
		props: {
			authorizations: authorizations,
			managers: managers
		}
	};
}
