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
	// Get project data from DB
	
    var projectID = params.projectID;
	var projectDetail;
	var response = await axios.get(`/project/${projectID}`, {
		headers: { Cookie: "access_token=" + cookie }
	});
	if (response.data.success === true) {
		projectDetail = response.data.project;
	}

    let tasks = [];
    var response = await axios.get(`/all-tasks-in-project/${projectID}`, {
		headers: { Cookie: "access_token=" + cookie }
	});
	if (response.data.success === true) {
		tasks = response.data.tasks;
		console.log("tasks", tasks)
	}

	if (tasks != null){
		// Get total tasks in project
		let TotalTaskInProject = tasks.length
			
		// Lọc các đối tượng có thuộc tính 'completionDate'
		let taskWithCompletionDate = tasks.filter(task => 'completionDate' in task);

		//lọc các đối tượng có task completed và complettionDate là '0001-01-01 00:00:00 +0000 UTC' tức là completionDate bằng null
		let taskCompleted = taskWithCompletionDate.filter(task => task.status === 'Completed' && task.completionDate != '0001-01-01 00:00:00 +0000 UTC');
		//sắp xếp dữ liệu theo ngày tăng dần
		let tasksDataInChart = taskCompleted.sort((a, b) => a.completionDate - b.completionDate);

		//Dữ liệu tasks trong chart
		tasksDataInChart = tasksDataInChart.map((item, index) => ({
			completionDate: new Date(item.completionDate), 
			group: "taskCompleted",
			value: TotalTaskInProject - 1 - index,
		}));
		//Sort employee ascending by date

		console.log("tasksDataInChart", tasksDataInChart);


		return {
			props: {
				projectID: projectID,
				tasksDataInChart: tasksDataInChart,
				project: projectDetail,
			}
		};
	}else{
		return {
            props: {
                projectID: projectID,
                project: projectDetail,
				tasksDataInChart: null,
            }
        };
	}
	
}