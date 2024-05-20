<script>
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import BreadCrumb from "$lib/components/Breadcrumb/AdminBreadcrumb.svelte";
	import { positionMapping } from "$lib/mappings/mappings.js";
	import  taskDataInChartOption  from './taskDataInChartOption.js';

	import { fade } from 'svelte/transition';
	import '@carbon/charts-svelte/styles.css';


	// import accountsTotalOptions from '$lib/options/charts/area/accountsTotalOptions.js';
	// import roles from '$lib/options/charts/pie/roles.js';
	// import rolesOptions from '$lib/options/charts/pie/rolesOptions.js';

	export let data;
    var tasksDataInChart = data.props.tasksDataInChart;
	var project = data.props.project;

	function ConvertDate(GetDate){
		let DateResponse;
		DateResponse = new Date(GetDate).toLocaleDateString()
		return DateResponse 
	}
	let ProjectCreateDate = ConvertDate(project.createdAt);
	let ProjectEndDate = ConvertDate(project.endDate);
   
	let AreaChart;
	let DonutChart;
	onMount(async () => {
		const { AreaChart: AsyncAreaChart, DonutChart: AsyncDonutChart } = await import(
			'@carbon/charts-svelte'
		);
		AreaChart = AsyncAreaChart;
		DonutChart = AsyncDonutChart;
	});
 
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



	// onMount(GetAllUserInfor);
</script>

<BreadCrumb depth="auth/accounts" />
<div class="-ml-16 sm:ml-5 mt-0 z-0 w-full h-fit bg-base-100 rounded-md p-5 rounded-tl-none">
	<h1 class="prose mb-3 font-bold text-2xl sm:text-3xl text-left w-auto">Accounts</h1>
	<div class="mt-2 sm:mt-0 ml-0 sm:m-1 sm:ml-auto px-2 py-1 rounded bg-base-100">
		<p>
			Start date
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				fill="currentColor"
				class="bi bi-calendar-plus inline"
				viewBox="0 0 16 16"
			>
				<path
					d="M8 7a.5.5 0 0 1 .5.5V9H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V10H6a.5.5 0 0 1 0-1h1.5V7.5A.5.5 0 0 1 8 7"
				/>
				<path
					d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"
				/>
			</svg>
			:
			{ProjectCreateDate}
		</p>
		<p>
			End date
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				fill="currentColor"
				class="bi bi-calendar-plus inline"
				viewBox="0 0 16 16"
			>
				<path
					d="M8 7a.5.5 0 0 1 .5.5V9H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V10H6a.5.5 0 0 1 0-1h1.5V7.5A.5.5 0 0 1 8 7"
				/>
				<path
					d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"
				/>
			</svg>
			:
			{ProjectEndDate}
		</p>
	</div>
	<div class="flex flex-col md:flex-row mb-5">
		<!-- async load the charts -->
		
		{#if AreaChart && DonutChart}
			<div in:fade class="w-full">
				<svelte:component this={AreaChart} data={tasksDataInChart} options={taskDataInChartOption} />
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
</div>
