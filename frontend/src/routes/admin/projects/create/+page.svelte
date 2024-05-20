<script>
	import { onMount } from "svelte";
	import toast, { Toaster } from "svelte-french-toast";
	import axios from "axios";
	import Breadcrumb from "$lib/components/Breadcrumb/AdminBreadcrumb.svelte";

	import { Carta, MarkdownEditor } from 'carta-md';
	import 'carta-md/default.css'; /* Default theme */
	import '@cartamd/plugin-code/default.css';
	import DOMPurify from 'isomorphic-dompurify';
	import { code } from '@cartamd/plugin-code';

	import { DateInput } from 'date-picker-svelte'

	let projectEndDate = new Date();
	let projectCreatedDate = new Date();
	//Set the maximum time selected in the calendar
	let maxDateSelectedInCalender = new Date("3000-1-1 00:00:00");

	const carta = new Carta({
		sanitizer: DOMPurify.sanitize,
		extensions: [code()]
	});
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
	

	// Project input
	var title;
	let errorMessage = '';
	let CurrentYear = new Date().getFullYear();
	let value = ''; //descripton field
	let leader = {
		id: 0,
		fullname: '',
		email: '',
		profile_image: ''
	};

	// On page load, get all managers
	onMount(async () => {
		// Call both functions when the component is mounted
		await GetAllManagers();
		await GetAllCustomers();
	});
	// Store the managers in database
	var managers = [];
	// view the customers in database
	var customers = [];

	var customersSelected = [];
	function HandleSelectCustomer(customerObj) {
		if (customersSelected.filter((obj) => obj.id === customerObj.id).length === 0) {
			customersSelected = [...customersSelected, customerObj];
		}
		console.log("c", customersSelected)
	}
	function deleteCustomerInArray(customer_id) {
		const index = customersSelected.findIndex((customersSelected) => customersSelected.id === customer_id);
		if (index !== -1) {
			customersSelected.splice(index, 1);
		}
	}

	// Get all employees whose role is manager
	async function GetAllManagers() {
		const response = await axios.get("/get-employee-by-role/Manager");
		managers = await response.data.employees;

	}

	// Get all employees whose role is manager
	async function GetAllCustomers() {
		const response = await axios.get("/get-employee-by-role/Customer");
		customers = await response.data.employees;
	}
	// GetAllCustomers() 
	// On submit, create a toast notification which will call the CreateProject function
	async function HandleSubmit(event) {
		event.preventDefault();
		//flush out any error message
		errorMessage = '';

		//check if fields are empty
		if (title == null) {
			errorMessage = 'Project title missing';
			// alert('Project name missing');
			return;
		}

		//check if fields are empty
		if (leader.id === 0) {
			errorMessage === ''
				? (errorMessage += 'Project leader missing')
				: (errorMessage += ', project leader missing');
			return;
			// alert('No project leader selected');
		}

		//Create id of customer when customer selected 
		var customers_id = [];
		if (customersSelected !== null && customersSelected.length > 0) {
			customersSelected.forEach((item) => {
				customers_id.push(item.id);
			});
		}


		try {
			const response = await axios.post("/project", {
				customers: customers_id,		
				title: title,
				description: value,
				leader: leader._id,
				createdAt: projectCreatedDate,
				endDate: projectEndDate,
			});
			const success = await response.data.success;
			const message = await response.data.message;
			if (success === true) {
				toast.success(message);
				await new Promise((resolve) => setTimeout(resolve, 3000));
				window.location.replace(`http://localhost:5173/admin/projects/${response.data.project}`);
			} else {
				toast.error(message);
			}
		} catch (error) {
			if (error.response.status === 400) {
				toast.error(error.response.data.message);
			} else {
				toast.error("Something went wrong. Please try again later.");
			}
		}
	}

	let selectManagerPanel;
	//open select panel, and retrieve selected user
	function openSelectManagerPanel() {
		selectManagerPanel.classList.remove('hidden');
	}

	function pickManager(id) {
		//retrieve selected user
		leader = managers.find((manager) => manager._id === id);
		selectManagerPanel.classList.add('hidden');
	}

	let selectCustomersPanel;
	//open select panel, and retrieve selected user
	function openSelectCustomersPanel() {
		selectCustomersPanel.classList.remove('hidden');
	}

	let filter = 'fullname';

	let searchManager = '';
	$: regexManager = searchManager ? new RegExp(searchManager, 'i') : null; //case insensitive
	$: matchesManager = (item) => (regexManager ? regexManager.test(item[filter]) : true); //ternary, check if regex is true, if true, test the regex, if false, return true

	let searchCustomer = '';
	$: regexCustomer = searchCustomer ? new RegExp(searchCustomer, 'i') : null; //case insensitive
	$: matchesCustomer = (item) => (regexCustomer ? regexCustomer.test(item[filter]) : true); //ternary, check if regex is true, if true, test the regex, if false, return true

</script>

<!-- Bread crumb dùng để điều hướng về trang trước đó 
	depth link điều hướng 
	show là tên hiện ra tương ứng với link điều hướng 
-->
<Breadcrumb depth="projects" show="Projects"/>
<Toaster position="bottom-right" />

<div class="-ml-16 sm:ml-5 z-0 w-auto h-fit bg-base-100 rounded-md p-5 rounded-tl-none">
	<input
		class="p-0 pl-3 input w-full sm:w-auto input-bordered h-10 prose font-bold text-2xl sm:text-3xl text-left"
		placeholder="Project name"
		bind:value={title}
		size="20"
	/>
	<!-- <p class="text-md opacity-50 pl-3">Year: {CurrentYear}</p> -->
	<div class="flex flex-wrap bg-neutral-200 mt-2 p-2 pl-3 w-full rounded-t">
		<button
			class="min-w-48 white-container flex flex-row items-center bg-neutral-100 p-2 rounded hover:scale-105 transition-all translate active:bg-neutral-300"
			on:click={openSelectManagerPanel}
		>
			<div class="avatar">
				<div class="sm:w-12 h-12 rounded-full ring-base-300 ring-2">
					<img
						src={leader.id !== 0
							? `/images/profile/${leader.profile_image}`
							: 'https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg'}
						alt="Project Leader"
					/>
				</div>
			</div>
			<div class="flex flex-col ml-2 mr-2 text-left">
				<strong>{leader.id !== 0 ? leader.fullname : 'Project leader'}</strong>
				<p class="text-xs opacity-55">
					{leader.id !== 0 ? leader.email : 'Click to select leader'}
				</p>
			</div>
		</button>
		<div class="hidden absolute z-10 bg-slate-100 rounded w-52 shadow-md" bind:this={selectManagerPanel}>
			<label
				class="input h-10 input-sm rounded rounded-b-none input-bordered flex items-center join-item w-full"
			>
				<input bind:value={searchManager} type="text" class="w-full" placeholder="search for candidate" />
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
			<div class="overflow-y-scroll max-h-52 w-52 overflow-x-hidden">
				{#each managers.filter(matchesManager) as Manager}
					<button
						class="p-2 flex justify-start bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 transition-all translate"
						on:click={() => pickManager(Manager._id)}
					>
						<div class="avatar">
							<div class="size-12 rounded-full ring-base-300 ring-2">
								<img src="/images/profile/{Manager.profile_image}" alt="Project Leader" />
							</div>
						</div>
						<div class=" text-left flex flex-col flex-grow-0 ml-2 mr-2">
							<strong class="line-clamp-1 w-auto">{Manager.fullname}</strong>
							<p class="text-xs opacity-55">{Manager.email}</p>
						</div>
					</button>
				{/each}
			</div>
		</div>
	</div>
	<div class="flex flex-col bg-neutral-200 rounded rounded-tl-none w-auto pb-3">
		<div class="mx-3 p-3 rounded bg-base-100 w-auto markdown">
			<p class="font-medium text-md mb-2 w">Project description:</p>
			<div class="w-full">
				<MarkdownEditor {carta} bind:value mode="tabs" />
			</div>
		</div>
	</div>
	<div class="flex bg-neutral-200 rounded rounded-tl-none w-auto pb-3">
		<div class="flex items-center mx-3 p-3 rounded bg-base-100 w-full markdown">
			<div class="font-medium text-md mr-2">Project Created Date:</div>
			<div class="w-auto">
				<DateInput 	format="yyyy/MM/dd HH:mm:ss" 
							max={maxDateSelectedInCalender}
							bind:value={projectCreatedDate} />
			</div>
		</div>
		<div class="flex items-center mx-3 p-3 rounded bg-base-100 w-full markdown">
			<div class="font-medium text-md mr-2">Project End Date:</div>
			<div>
				<DateInput 	format="yyyy/MM/dd HH:mm:ss" 
							max={maxDateSelectedInCalender}
							bind:value={projectEndDate} />
			</div>
		</div>	
	</div>
	<div class="flex flex-wrap bg-neutral-200 mt-2 p-2 pl-3 w-full rounded-t">
		<button
			class="min-w-48 white-container flex flex-row items-center bg-neutral-100 p-2 rounded hover:scale-105 transition-all translate active:bg-neutral-300"
			on:click={openSelectCustomersPanel}
		>
			<div class="avatar">
				<div class="sm:w-12 h-12 rounded-full ring-base-300 ring-2">
					<img
						src='https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg'
						alt="Project Leader"
					/>
				</div>
			</div>
			<div class="flex flex-col ml-2 mr-2 text-left">
				<strong>Project customers</strong>
				<p class="text-xs opacity-55">
					Click to select customers
				</p>
			</div>
		</button>
		
		<div class="hidden absolute z-10 bg-slate-100 rounded w-52 shadow-md" bind:this={selectCustomersPanel}>
			<label
				class="input h-10 input-sm rounded rounded-b-none input-bordered flex items-center join-item w-full"
			>
				<input bind:value={searchCustomer} type="text" class="w-full" placeholder="search for customer" />
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
			<div class="overflow-y-scroll max-h-52 w-52 overflow-x-hidden">
				{#if customers}
					{#each customers.filter(matchesCustomer) as Customer}
						<button
							class="p-2 flex justify-start bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 transition-all translate"
							on:click={HandleSelectCustomer({
								id: Customer._id,
								fullname: Customer.fullname
							})}
						>
							<div class="avatar">
								<div class="size-12 rounded-full ring-base-300 ring-2">
									<img src="/images/profile/{Customer.profile_image}" alt="Project Leader" />
								</div>
							</div>
							<div class=" text-left flex flex-col flex-grow-0 ml-2 mr-2">
								<strong class="line-clamp-1 w-auto">{Customer.fullname}</strong>
								<p class="text-xs opacity-55">{Customer.email}</p>
							</div>
						</button>
					{/each}
				{/if}
			</div>			
		</div>
		<div class="flex flex-nowrap ml-2">
			{#each customersSelected as customer}
				<div
					class="mr-2 font-bold bg-neutral-100"
					style="width:fit-content ;height:fit-content"
				>
					{customer.fullname}
					<button
						on:click={() => {
							//delete member id in array
							deleteCustomerInArray(customer.id);
							//show member just delete again
							customersSelected = customersSelected.filter((customer1) => customer1.id !== customer.id);
							console.log(customersSelected);
						}}
					>
						<svg
							aria-hidden="true"
							class="w-5 h-5"
							fill="currentColor"
							viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg"
							><path
								fill-rule="evenodd"
								d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
								clip-rule="evenodd"
							></path></svg
						>
					</button>
				</div>
			{/each}
		</div>
	</div>
	<div class="flex justify-end gap-2 px-1 py-2">
		<p class="text-red-500 text-sm">{errorMessage}</p>
		<button class="btn btn-sm w-32 h-10 btn-primary" on:click={HandleSubmit}>Create</button>
		<a href="/admin/projects" class="btn btn-sm w-32 h-10">Cancel</a>
	</div>
</div>

<style>
	:global(.carta-theme__default .carta-input, .carta-theme__default .carta-renderer) {
		height: 120px;
	}
	:global(.carta-editor) {
		width: 99%;
		/* this forces the upper toolbar to resize to screen, 
			thus making the container fit to screen without side scroll */
	}
</style>
