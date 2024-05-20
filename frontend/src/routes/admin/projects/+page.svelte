<script>
	import { onMount } from "svelte";
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

	export let data;
	// Store the currently logged in user
	var currentUser = data.props.currentUser;

	// On page load, get all projects from database

	// Store the projects in database
	var projects = [],
		loading = true,
		error = false;

	// Get all projects from database
	async function GetProjects() {
        await axios
			.get(`/projects`)
			.then((response) => {
				projects = response.data.projects;
				loading = false;
			})
			.catch((error) => {
				error = true;
				loading = false;
			});
	}

	function ProgressCaculation(project, numberOfAllTasksInProject) {
		let completedTasks = 0;
		let progress = 0;
		// Lặp qua các task trong project
		project.tasks.forEach((task) => {
			// Nếu trạng thái của task là "completed", tăng biến completedTasks lên 1
			if (task.status === "Completed") {
				completedTasks++;
			}
		});
		progress = Math.round((completedTasks / numberOfAllTasksInProject) * 100);

		//Check if progress is NaN value
		if (isNaN(progress)) {
			progress = 0;
		}
		// Trả về số lượng task đã hoàn thành trong project
		return progress;
	}
	function ConvertDate(GetCreatedAt) {
		let createdAt;
		createdAt = new Date(GetCreatedAt).toLocaleDateString();
		return createdAt;
	}
	let filter = "title";
	let search = "";
	$: regex = search ? new RegExp(search, "i") : null; //case insensitive

	$: matches = (item) =>
		regex ? regex.test(filter !== "fullname" ? item[filter] : item["user_info"][0][filter]) : true; //ternary, check if regex is true, if true, test the regex, if false, return true
	GetProjects();
	// onMount(GetProjects);
</script>

<div class="-ml-16 sm:ml-5 mt-0 z-0 w-auto h-fit bg-base-100 rounded-md p-5 rounded-tl-none">
	<h1 class="prose mb-3 font-bold text-2xl sm:text-3xl text-left">List of projects</h1>
	<div class="overflow-x-auto p-3 bg-neutral-200 rounded-md">
		<div class="flex sm:flex-row flex-col-reverse sm:gap-2">
            <a href="../admin/projects/create">
				<button class="btn btn-sm h-10 btn-primary font-normal mb-3">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						fill="currentColor"
						class="bi bi-plus-circle"
						viewBox="0 0 18 16"
					>
						<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
						<path
							d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"
						/>
					</svg>
					New project</button
				>
			</a>
			<div class="join mb-3">
				<select
					bind:value={filter}
					class="w-20 sm:w-auto select select-sm select-bordered h-10 join-item"
				>
					<option value="fullname">Leader</option>
					<option value="title">Project name</option>
				</select>
				<label
					class="input h-10 sm:w-96 input-sm input-bordered flex items-center join-item w-full"
				>
					<input bind:value={search} type="text" class="w-full" placeholder="Search for project" />
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						class="sm:w-4 h-4 opacity-70"
						><path
							fill-rule="evenodd"
							d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
							clip-rule="evenodd"
						/></svg
					>
				</label>
			</div>
		</div>
		<div class="px-3 w-full rounded-md flex flex-col sm:flex-row items-start justify-start">
			<div class="mr-2 sm:w-24">
				<div class="prose font-bold text-xl sm:w-24 hidden sm:inline">Leader</div>
				<div class="text-sm hidden sm:inline opacity-50">Name</div>
				<div class="text-sm inline sm:hidden opacity-50">Leader's name</div>
			</div>
			<div class="divider divider-horizontal"></div>
			<div class="mr-2 flex flex-row sm:flex-col">
				<div class="prose font-bold text-xl sm:w-60">Project name</div>
				<div class="text-sm hidden sm:inline opacity-50">Date</div>
			</div>
			<div class="divider divider-horizontal"></div>
			<div class="sm:w-56 mr-2 text-left">
				<div class="inline sm:hidden prose text-sm badge-md badge badge-secondary">Progress</div>
				<div class="hidden sm:inline prose font-bold text-xl">Progress</div>
				<progress
					class="progress progress-primary sm:w-56 m-0 mr-auto ml-0 hidden sm:inline"
					value="0"
					max="100"
				></progress>
			</div>
			<div class="divider divider-horizontal"></div>
			<div class="sm:w-56 mr-2 hidden sm:inline">
				<div class="prose font-bold text-xl text-left">Create/Update date</div>
			</div>
		</div>

		<div class="divider divider-neutral m-0 mb-2" />
		<!-- for loop -->
		<!-- row-content -->
		{#if error === true}
			<div
				class="px-3 w-full rounded-md flex flex-col sm:flex-row text-red-500 items-start justify-center"
			>
				Something went wrong. Please try again later.
			</div>
		{:else if loading === true}
			<div class="px-3 w-full rounded-md flex flex-col sm:flex-row items-start justify-center">
				Loading ...
			</div>
		{:else if projects === null}
			<div class="px-3 w-full rounded-md flex flex-col sm:flex-row items-start justify-center">
				No project found.
			</div>
		{:else}
			{#each projects.filter(matches) as project}
				<div class="p-1 sm:p-0">
					<a
						href="/admin/projects/{project?._id}"
						class="flex flex-col sm:flex-row align-baseline p-2 sm:p-3 rounded-md w-full hover:bg-neutral-100 hover:shadow-md transition ease-out hover:-translate-y-1 hover:scale-100 active:bg-slate-200 hover:border-y-[2px] hover:border-slate-200"
					>
						<div class="mr-2 sm:w-24 flex flex-col items-start sm:items-center">
							<div class="avatar hidden sm:inline">
								<div class="sm:w-12 h-12 rounded-full align">
									<img
										alt="Project leader profile"
										src="/images/profile/{project?.user_info[0]?.profile_image}"
									/>
								</div>
							</div>
							<div class="text-sm opacity-50 sm:w-24 sm:truncate">
								{project?.user_info[0]?.fullname}
							</div>
						</div>
						<div class="divider divider-horizontal"></div>
						<div class="mr-2 flex flex-row sm:flex-col justify-between sm:justify-center">
							<div class="font-bold text-xl sm:w-60 text-left truncate">{project?.title}</div>
							<div class="text-sm opacity-50 sm:w-60 text-left">
								{ConvertDate(project.createdAt)}
							</div>
						</div>
						<div class="divider divider-horizontal"></div>

						<div class="flex justify-center flex-col gap-y-2 mr-2">
							<span class="badge badge-secondary badge-md mr-auto ml-0"
								>{ProgressCaculation(project, project.tasks.length)}%</span
							>
							<progress
								class="progress progress-primary w-56 m-0 mr-auto ml-0"
								value={ProgressCaculation(project, project.tasks.length)}
								max="100"
							></progress>
						</div>
						<div class="divider divider-horizontal"></div>
						<div
							class="mr-2 flex text-left flex-row gap-3 sm:flex-col sm:justify-center text-sm sm:text-md opacity-50 sm:opacity-100"
						>
							<div class="sm:w-60">
								<b class="hidden sm:inline">Create date:</b>
								{ConvertDate(project.createdAt)}	
							</div>
							<div class="sm:w-60 text-left">
								<b class="hidden sm:inline">Update date:</b>
								{ConvertDate(project.updatedAt)}
							</div>
						</div>
					</a>
				</div>
			{/each}
		{/if}
	</div>
</div>
