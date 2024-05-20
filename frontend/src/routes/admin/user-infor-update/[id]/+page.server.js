// import { writeFile } from "node:fs/promises";
// import { extname } from "path";
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
	const notSafeCookie = cookies.get("access_token");
	const cookie = encodeURIComponent(notSafeCookie);

	var employee, authorizations, managers;
	var response = await axios.get(`/get-employee-detail/${params.id}`, {
		headers: {
			Cookie: "access_token=" + cookie
		}
	});
	if (response.data.success === true) {
		employee = response.data.employee;
	}

	response = await axios.get("/authorization-get-all", {
		headers: {
			Cookie: "access_token=" + cookie
		}
	});
	if (response.data.success === true) {
		authorizations = response.data.authorizations;
	}

	response = await axios.get("/get-employee-by-role/Director", {
		headers: {
			Cookie: "access_token=" + cookie
		}
	});
	if (response.data.success === true) {
		managers = response.data.employees;
	}

	response = await axios.get("/get-employee-by-role/Manager", {
		headers: {
			Cookie: "access_token=" + cookie
		}
	});
	if (response.data.success === true) {
		if (response.data.employees != null) {
			for (var i = 0; i < response.data.employees.length; i++) {
				if (managers != null) {
					managers.push(response.data.employees[i]);
				}
			}
		}
	}

	return {
		props: {
			employee: employee,
			authorizations: authorizations,
			managers: managers
		}
	};
}
