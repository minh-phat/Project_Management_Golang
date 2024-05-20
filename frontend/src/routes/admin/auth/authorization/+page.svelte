<script>
	import { onMount } from "svelte";
	import ConfirmDialog from "$lib/ConfirmDialog.svelte";
	import toast, { Toaster } from "svelte-french-toast";
	import { goto } from "$app/navigation";
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

	// On page load, get all authorizations from database
	onMount(GetAuthorizations);

	// Store the authorizations in database
	var authorizations = [],
		loading = true,
		error = false;

	// Get all authorizations from database
	async function GetAuthorizations() {
		loading = true;
		const response = await axios.get("/authorization-get-all");
		const success = await response.data.success;

		if (success === true) {
			authorizations = [];

			var tempAuthorizations = [];
			tempAuthorizations = await response.data.authorizations;

			// Get number of accounts for each authorization
			for (var authorization of tempAuthorizations) {
				const response = await axios.get(`/get-employee-by-role/${authorization.LevelName}`);
				var accountNumber = await response.data.employees;
				if (accountNumber != null && accountNumber.length > 0) {
					authorization.AccountNumber = accountNumber.length;
				} else {
					authorization.AccountNumber = 0;
				}

				authorizations.push(authorization);
			}

			searchResults = authorizations;

			loading = false;
		} else {
			error = true;
		}
	}

	var isDialogOpen = false,
		authorizationId = null,
		objectName = null;

	async function HandleConfirm() {
		try {
			const response = await axios.delete(`/authorization/${authorizationId}`);
			const success = await response.data.success;
			const message = await response.data.message;
			if (success === true) {
				toast.success(message);
			} else {
				toast.error(message);
			}
		} catch (error) {
			if (error.response) {
				if (error.response.status === 400) {
					toast.error(error.response.data.message);
				} else {
					toast.error("Something went wrong. Please try again later.");
				}
			}
		}

		await GetAuthorizations();
		isDialogOpen = false;
		authorizationId = null;
		objectName = null;
	}

	function HandleCancel() {
		isDialogOpen = false;
		authorizationId = null;
		objectName = null;
	}

	function OpenDialog(id, name) {
		isDialogOpen = true;
		authorizationId = id;
		objectName = name;
	}

	var searchQuery = "",
		searchResults = null;
	function SearchAuthorization(event) {
		searchQuery = event.target.value.toLowerCase();
		if (searchQuery === "") {
			searchResults = authorizations;
		} else {
			searchResults = authorizations.filter((authorization) =>
				authorization.LevelName.toLowerCase().includes(searchQuery)
			);
		}
	}
</script>

<Toaster position="bottom-right" />

<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
	<div class="relative overflow-hidden bg-white shadow-md dark:bg-gray-800">
		<div
			class="flex-row items-center justify-between p-4 space-y-3 sm:flex sm:space-y-0 sm:space-x-4"
		>
			<div>
				<h5 class="mr-3 font-semibold dark:text-white">Authorizations</h5>
				<p class="text-gray-500 dark:text-gray-400">Manage and add authorizations</p>
			</div>
			<div
				class="flex flex-col items-stretch justify-end flex-shrink-0 w-full space-y-2 md:w-auto md:flex-row md:space-y-0 md:items-center md:space-x-3"
			>
				<label for="table-search" class="sr-only">Search</label>
				<div class="relative">
					<div
						class="absolute inset-y-0 left-0 rtl:inset-r-0 rtl:right-0 flex items-center ps-3 pointer-events-none"
					>
						<svg
							class="w-5 h-5 text-gray-500"
							aria-hidden="true"
							fill="currentColor"
							viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg"
							><path
								fill-rule="evenodd"
								d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
								clip-rule="evenodd"
							></path></svg
						>
					</div>
					<input
						type="text"
						id="table-search"
						on:input={SearchAuthorization}
						class="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-s-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500"
						placeholder="Search authorizations"
					/>
				</div>

				<button
					on:click={() => {
						goto("./authorization/create");
					}}
					type="button"
					class="flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg dark:bg-green-600 dark:hover:bg-green-700 bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 focus:outline-none dark:focus:ring-green-800"
				>
					<svg
						fill="#ffffff"
						width="23px"
						viewBox="0 0 52.00 52.00"
						data-name="Layer 1"
						xmlns="http://www.w3.org/2000/svg"
						stroke="#ffffff"
						stroke-width="0.0005200000000000001"
						transform="rotate(0)"
						class="mr-2"
					>
						<g id="SVGRepo_bgCarrier" stroke-width="0" />

						<g
							id="SVGRepo_tracerCarrier"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke="#CCCCCC"
							stroke-width="0.624"
						/>

						<g id="SVGRepo_iconCarrier">
							<path
								d="M38.3,27.2A11.4,11.4,0,1,0,49.7,38.6,11.46,11.46,0,0,0,38.3,27.2Zm2,12.4a2.39,2.39,0,0,1-.9-.2l-4.3,4.3a1.39,1.39,0,0,1-.9.4,1,1,0,0,1-.9-.4,1.39,1.39,0,0,1,0-1.9l4.3-4.3a2.92,2.92,0,0,1-.2-.9,3.47,3.47,0,0,1,3.4-3.8,2.39,2.39,0,0,1,.9.2c.2,0,.2.2.1.3l-2,1.9a.28.28,0,0,0,0,.5L41.1,37a.38.38,0,0,0,.6,0l1.9-1.9c.1-.1.4-.1.4.1a3.71,3.71,0,0,1,.2.9A3.57,3.57,0,0,1,40.3,39.6Z"
							/> <circle cx="21.7" cy="14.9" r="12.9" />
							<path
								d="M25.2,49.8c2.2,0,1-1.5,1-1.5h0a15.44,15.44,0,0,1-3.4-9.7,15,15,0,0,1,1.4-6.4.77.77,0,0,1,.2-.3c.7-1.4-.7-1.5-.7-1.5h0a12.1,12.1,0,0,0-1.9-.1A19.69,19.69,0,0,0,2.4,47.1c0,1,.3,2.8,3.4,2.8H24.9C25.1,49.8,25.1,49.8,25.2,49.8Z"
							/>
						</g>
					</svg>
					Add authorization
				</button>
			</div>
		</div>
	</div>
	<table
		class="w-full text-sm text-left table-fixed rtl:text-right text-gray-500 dark:text-gray-400"
	>
		<thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
			<tr>
				<th scope="col" class="px-6 py-4 w-[222px]"> Authorization </th>
				<th scope="col" class="px-6 py-4"> Description </th>
				<th scope="col" class="px-6 py-4 text-center w-[222px]"> Number of Accounts </th>
				<th scope="col" class="px-6 py-4 text-center w-[222px]"> Actions </th>
			</tr>
		</thead>
		<tbody>
			{#if error === true}
				<tr
					class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
				>
					<td colspan="4" class="px-6 py-4 text-center text-red-500 dark:text-red-400">
						Something went wrong. Please try again later.
					</td>
				</tr>
			{:else if loading === true}
				<tr
					class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
				>
					<td colspan="4" class="px-6 py-4 text-center"> Loading... </td>
				</tr>
			{:else if authorizations.length === 0}
				<tr
					class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
				>
					<td colspan="4" class="px-6 py-4 text-center"> No authorization found. </td>
				</tr>
			{:else}
				{#each searchResults as authorization}
					<tr
						class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
					>
						<th
							scope="row"
							class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
						>
							{authorization.LevelName}
						</th>
						<td class="px-6 py-4"> {authorization.Description} </td>
						<td class="px-6 py-4 text-center"> {authorization.AccountNumber} </td>
						<td class="px-6 py-4 text-center">
							<button
								on:click={() => {
									goto(`./authorization/${authorization.Id}`);
								}}
								class="px-4 py-2.5 mr-1 text-base font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
							>
								Update
							</button>

							<button
								class="px-4 py-2.5 ml-1 text-base font-medium text-center text-white bg-red-700 rounded-lg focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900 hover:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-red-700"
								on:click={(event) => {
									event.preventDefault();
									OpenDialog(authorization.Id, authorization.LevelName);
								}}
								disabled={authorization.AccountNumber == 0 ? false : true}
							>
								Delete
							</button>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<ConfirmDialog
	isOpen={isDialogOpen}
	onConfirm={HandleConfirm}
	onCancel={HandleCancel}
	name={objectName}
></ConfirmDialog>
