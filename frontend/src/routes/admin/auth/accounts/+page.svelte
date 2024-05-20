<script>
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import ChangeStateDialog from "./ChangeStateDialog.svelte";
	import BreadCrumb from "$lib/components/Breadcrumb/AdminBreadcrumb.svelte";
	import { positionMapping } from "$lib/mappings/mappings.js";
	import { employeeDataInChart } from './employeeData.js';
	import  employeeDataInChartOption  from './employeeDataChartOption.js';

	import '@carbon/charts-svelte/styles.css';
	import { fade } from 'svelte/transition';

	// import '@carbon/charts-svelte/styles.css';
	// import accountsTotalOptions from '$lib/options/charts/area/accountsTotalOptions.js';
	// import roles from '$lib/options/charts/pie/roles.js';
	// import rolesOptions from '$lib/options/charts/pie/rolesOptions.js';

	//bringing stuffs in

	let AreaChart;
	let DonutChart;
	onMount(async () => {
		const { AreaChart: AsyncAreaChart, DonutChart: AsyncDonutChart } = await import(
			'@carbon/charts-svelte'
		);
		AreaChart = AsyncAreaChart;
		DonutChart = AsyncDonutChart;
	});
    console.log("employeeDataChart1", employeeDataInChart);

	let employeesList = [];

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


	var employees = [];
	var filterState = "0";
	let StateChangeTo = "";
	let StateNameToChange = "";
	let UpdateEmployeeID = "";
	let showDialog = false;
	var error = false;
	var loading = true;

	function handleOK() {
		axios
			.post("/employee-update-state", {
				state: StateChangeTo,
				employee_id: UpdateEmployeeID
			})
			.then((reponse) => {
				window.location.reload("http://localhost:5173/admin/accounts");
			})
			.catch((error) => {
				console.log(error);
			});

		// console.log('OK button clicked');
		// showDialog = false;
	}

	function handleCancel() {
		console.log("Cancel button clicked");
		showDialog = false;
	}

	async function GetAllUserInfor() {
		await axios
			.get("/employee-get-all")
			.then((response) => {
				// Handle the response data here
				employees = response.data.employees; // Assign the fetched JSON data to the jsonData variable
				employeesList = employees;
				loading = false;
				console.log(employeesList);
				// console.log(employees);
			})
			.catch((err) => {
				// Handle any errors here
				error = true;
				console.error(err);
			});
	}

	let sortFields = [
		{
			value: "fullname",
			label: "Name"
		},
		{
			value: "position",
			label: "Position"
		},
		{
			value: "authorization_level",
			label: "Authorizations"
		}
		// {
		// 	value: "updatedAt",
		// 	label: "Last Updated"
		// }
	];
	let searchKeys = [
		{
			value: "fullname",
			label: "Name"
		},
		// {
		// 	value: "position",
		// 	label: "Position"
		// },
		{
			value: "authorization_level",
			label: "Auth level"
		}
	];
	let sortDirection = "asc";
	let sortKey = "fullname";
	$: sortedList = [...employeesList].sort((a, b) => {
		console.log(employeesList);
		// if (sortKey === "updatedAt") {
		// 	return sortDirection === "asc"
		// 		? new Date(a[sortKey]) - new Date(b[sortKey])
		// 		: new Date(b[sortKey]) - new Date(a[sortKey]);
		// }

		if (typeof sortKey === "number" || typeof a[sortKey][0] === "number") {
			return sortDirection === "asc"
				? a[sortKey][0] - b[sortKey][0]
				: b[sortKey][0] - a[sortKey][0];
		}

		if (typeof sortKey === "string" && typeof a[sortKey][0] === "string") {
			if (sortDirection === "asc") {
				return a[sortKey][0].localeCompare(b[sortKey][0]);
			} else {
				return b[sortKey][0].localeCompare(a[sortKey][0]);
			}
		}
	});

	// var employeesSearch = [];
	// function SearchFullName(event) {
	// 	var searchQuery = event.target.value.toLowerCase();
	// 	if (searchQuery === "") {
	// 		employeesSearch = employees;
	// 	} else {
	// 		employeesSearch = employees.filter((employee) =>
	// 			employee.fullname[0].toLowerCase().includes(searchQuery)
	// 		);
	// 	}
	// }

	let searchKey = "fullname";
	let search = "";
	//Use regex to search for the query in selected field
	$: regex = search ? new RegExp(search, "i") : null; //case insensitive
	$: matches = (item) => (regex ? regex.test(item[searchKey]) : true); //ternary, check if regex is true, if true, test the regex, if false, return true

	onMount(GetAllUserInfor);
</script>

{#if showDialog}
	<ChangeStateDialog state={StateNameToChange} on:ok={handleOK} on:cancel={handleCancel} />
{/if}
<BreadCrumb depth="auth/accounts" />
<div class="-ml-16 sm:ml-5 mt-0 z-0 w-full h-fit bg-base-100 rounded-md p-5 rounded-tl-none">
	<h1 class="prose mb-3 font-bold text-2xl sm:text-3xl text-left w-auto">Accounts</h1>

	<p class="prose text-lg">Available roles:</p>
	<div class="p-2">
		<ul class=" flex flex-row gap-2 flex-wrap">
			<li class="badge badge-primary">Director</li>
			<li class="badge badge-primary">Admin</li>
			<li class="badge badge-primary">Manager</li>
			<li class="badge badge-primary">Employee</li>
			<li class="badge badge-primary">Guest</li>
		</ul>
	</div>
	<div class="flex flex-col md:flex-row mb-5">
		<!-- async load the charts -->
		{#if AreaChart && DonutChart}
			<div in:fade class="w-full">
				<svelte:component this={AreaChart} data={employeeDataInChart} options={employeeDataInChartOption} />
			</div>
			<div class="divider sm:divider-horizontal" />
			<!-- <div class="basis-3/5" in:fade>
				<svelte:component this={DonutChart} data={roles} options={rolesOptions} />
			</div> -->
		{:else}
			<div class="h-[250px] w-full flex justify-center items-center">
				<span class="loading loading-lg loading-spinner text-primary"></span>
			</div>
			<div class="divider sm:divider-horizontal" />
			<div class="basis-3/5 h-[250px] w-full flex justify-center items-center">
				<span class="loading loading-lg loading-spinner text-primary"></span>
			</div>
		{/if}
	</div>

	<div class="flex flex-col sm:flex-row justify-between w-full mb-2">
		<div class="flex flex-col sm:flex-row-reverse gap-2 w-full">
			<div class="flex sm:flex-row flex-row-reverse gap-2 w-full">
				<div class="searchArea join w-full sm:w-auto">
					<select
						bind:value={searchKey}
						class="w-auto select select-sm select-bordered h-10 join-item bg-white"
					>
						<option disabled selected value="">Filter</option>
						{#each searchKeys as searchOption}
							<option value={searchOption.value}>{searchOption.label}</option>
						{/each}
					</select>
					<label
						class="bg-white input h-10 sm:w-96 input-sm input-bordered flex items-center join-item w-full"
					>
						<input
							bind:value={search}
							type="text"
							class="w-full"
							placeholder="Search for account"
						/>
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
				<details class="dropdown">
					<summary class="btn btn-sm h-10 bg-white"
						><svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							fill="currentColor"
							class="bi bi-funnel"
							viewBox="0 0 16 16"
						>
							<path
								d="M3.5 3.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 12.293zm4 .5a.5.5 0 0 1 0-1h1a.5.5 0 0 1 0 1zm0 3a.5.5 0 0 1 0-1h3a.5.5 0 0 1 0 1zm0 3a.5.5 0 0 1 0-1h5a.5.5 0 0 1 0 1zM7 12.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7a.5.5 0 0 0-.5.5"
							/>
						</svg></summary
					>
					<ul class="mt-1 shadow menu dropdown-content z-[1] rounded-md w-52 bg-white">
						<div class="flex justify-between">
							<h1 class="prose font-bold ml-2">Sort by:</h1>
							<!-- sort direction -->
							<button
								on:click={() => {
									sortDirection = sortDirection === "asc" ? "desc" : "asc";
								}}
								class="btn btn-sm bg-white h-10 hover:bg-neutral-200"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									fill="currentColor"
									class="bi bi-sort-down-alt"
									viewBox="0 0 16 16"
								>
									{#if sortDirection === "asc"}
										<!-- down sort -->
										<path
											d="M3.5 3.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 12.293zm4 .5a.5.5 0 0 1 0-1h1a.5.5 0 0 1 0 1zm0 3a.5.5 0 0 1 0-1h3a.5.5 0 0 1 0 1zm0 3a.5.5 0 0 1 0-1h5a.5.5 0 0 1 0 1zM7 12.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7a.5.5 0 0 0-.5.5"
										/>
									{:else}
										<!-- up sort -->
										<path
											d="M3.5 12.5a.5.5 0 0 1-1 0V3.707L1.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.5.5 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L3.5 3.707zm3.5-9a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1z"
										/>
									{/if}
								</svg>
							</button>
						</div>
						<!-- radio button -->
						{#each sortFields as filterOption}
							<li class="">
								<label class="cursor-pointer flex items-center gap-1">
									<input
										type="radio"
										name="sort"
										value={filterOption.value}
										bind:group={sortKey}
										class="form-radio"
									/>
									{filterOption.label}
								</label>
							</li>
						{/each}
					</ul>
				</details>
			</div>
			<a class="btn btn-sm h-10 btn-primary font-normal mb-3 hover:bg-secondary hover:-translate-y-1 hover:shadow-md" href="/admin/employee-add">
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
				Add an employee</a
			>
		</div>
		<div>
			<select
				bind:value={filterState}
				class="w-20 sm:w-auto select select-sm select-bordered h-10 join-item bg-white"
			>
				<option disabled selected value="">Filter state</option>
				<option value="0" selected>Active</option>
				<option value="1">Resigned</option>
			</select>
		</div>
	</div>

	<table class="w-full text-sm text-left rtl:text-right text-gray-500 rounded overflow-clip">
		<thead class="text-xs uppercase bg-gray-50 prose">
			<tr>
				<th scope="col" class="px-6 py-3"> Name </th>
				<th scope="col" class="px-6 py-3"> Position </th>
				<th scope="col" class="px-6 py-3"> Authorization </th>
				<th scope="col" class="px-6 py-3"> Status </th>
				<th scope="col" class="px-6 py-3"> Action </th>
			</tr>
		</thead>
		<tbody>
			{#if error === true}
				<tr class="bg-white border-b hover:bg-gray-100">
					<td colspan="4" class="px-6 py-4 text-center text-red-500 dark:text-red-400">
						Something went wrong. Please try again later.
					</td>
				</tr>
			{:else if loading === true}
				<tr class="bg-white border-b hover:bg-gray-100">
					<td colspan="4" class="px-6 py-4 text-center"> Loading... </td>
				</tr>
			{:else if employees.length === 0}
				<tr class="bg-white border-b hover:bg-gray-100">
					<td colspan="4" class="px-6 py-4 text-center"> No authorization found. </td>
				</tr>
			{:else}
				{#each sortedList.filter(matches) as employee}
					{#if employee.state.toString() === filterState}
						<tr class="bg-white border-b hover:bg-gray-100">
							<th
								scope="row"
								class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
							>
								<!-- svelte-ignore a11y-img-redundant-alt -->
								<img
									style:border-color={employee.state == 0 ? "green" : "red"}
									class="w-12 rounded-full border-2"
									src="/images/profile/{employee.profile_image[0]}"
									alt="Profile image"
								/>
								<a href="../../../view-detail-employee/{employee._id}">
									<div class="ps-3">
										<div class="text-base prose font-semibold">{employee.fullname[0]}</div>
										<div class="font-normal text-gray-500">{employee.email[0]}</div>
									</div>
								</a>
							</th>
							{#if employee.position[0] === -1}
								<td class="px-6 py-4">_</td>
							{:else}
								<td class="px-6 py-4">{positionMapping[employee.position[0]]}</td>
							{/if}
							<td class="px-6 py-4">{employee.authorization_level}</td>
							{#if employee.state == 0}
								<td class="px-6 py-4">
									<button
										class="flex items-center"
										on:click={() => {
											event.preventDefault();
											showDialog = true;
											StateChangeTo = "1";
											StateNameToChange = "Resgined";
											UpdateEmployeeID = employee.employee_id;
										}}
									>
										<div class="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div>
										Active
									</button>
								</td>
							{:else}
								<td class="px-6 py-4">
									<button
										class="flex items-center"
										on:click={() => {
											event.preventDefault();
											showDialog = true;
											StateChangeTo = "0";
											StateNameToChange = "Active";
											UpdateEmployeeID = employee.employee_id;
										}}
									>
										<div class="h-2.5 w-2.5 rounded-full bg-red-500 me-2"></div>
										Resigned
									</button>
								</td>
							{/if}
							<td class="px-6 py-4">
								<button
									on:click={() => goto(`/admin/user-infor-update/${employee.employee_id}`)}
									class="btn btn-sm h-10 bg-teal-500 bg-gradient-to-t prose font-normal hover:shadow-md hover:-translate-y-[3px] hover:bg-teal-400 transition-all duration-200"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										fill="white"
										class="bi bi-pencil-fill"
										viewBox="0 0 16 16"
									>
										<path
											d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"
										/>
									</svg>
								</button>
							</td>
						</tr>
					{/if}
				{/each}
			{/if}
		</tbody>
	</table>
</div>
