<script>
	import { onMount } from "svelte";
	import { form, field } from "svelte-forms";
	import { required } from "svelte-forms/validators";
	import toast, { Toaster } from "svelte-french-toast";
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
	import { officeMapping, departmentMapping } from "$lib/mappings/mappings.js";

	// Project input
	var title = field("title", "", [required()]);
	var description = field("description", "");
	var leaderId = field("leaderId", "", [required()], {
		checkOnInit: true
	});
	var leaderName;
	const projectForm = form(title, description, leaderId);

	// On page load, get all managers
	onMount(GetAllManagers);
	// Store the managers in database
	var managers = [];
	var managersUpperPagination,
		managersLowerPagination,
		managerPagination = [];
	// Get all employees whose role is manager
	async function GetAllManagers() {
		const response = await axios.get("/get-employee-by-role/Manager");
		managers = await response.data.employees;

		// Set upper and lower limit for pagination
		if (managers != null && managers.length >= 5) {
			managersUpperPagination = 5;
			managersLowerPagination = 1;
		} else {
			if (managers != null) {
				managersUpperPagination = managers.length;
				managersLowerPagination = 1;
			} else {
				managersUpperPagination = 0;
				managersLowerPagination = 0;
			}
		}

		// Set the pagination
		if (managers != null) {
			managerPagination = managers.slice(managersLowerPagination - 1, managersUpperPagination);
		} else {
			managerPagination = null;
		}
	}

	// Go to next page of pagination
	function NextPage(event) {
		event.preventDefault();

		if (searchResults === null) {
			if (managersUpperPagination <= managers.length - 5) {
				managersUpperPagination += 5;
				managersLowerPagination = managersUpperPagination - 4;
			} else {
				managersUpperPagination = managers.length;
				if (managersUpperPagination % 5 >= 1) {
					managersLowerPagination = managersUpperPagination - ((managersUpperPagination % 5) - 1);
				}
			}

			managerPagination = managers.slice(managersLowerPagination - 1, managersUpperPagination);
		} else {
			if (managersUpperPagination <= searchResults.length - 5) {
				managersUpperPagination += 5;
				managersLowerPagination = managersUpperPagination - 4;
			} else {
				managersUpperPagination = searchResults.length;
				if (managersUpperPagination % 5 >= 1) {
					managersLowerPagination = managersUpperPagination - ((managersUpperPagination % 5) - 1);
				}
			}

			managerPagination = searchResults.slice(managersLowerPagination - 1, managersUpperPagination);
		}
	}

	// Go to previous page of pagination
	function PreviousPage(event) {
		event.preventDefault();

		if (searchResults === null) {
			if (managersLowerPagination > 5) {
				managersLowerPagination -= 5;
				managersUpperPagination = managersLowerPagination + 4;
			} else {
				managersLowerPagination = 1;
				if (managers.length >= 5) {
					managersUpperPagination = 5;
				} else {
					managersUpperPagination = managers.length;
				}
			}

			managerPagination = managers.slice(managersLowerPagination - 1, managersUpperPagination);
		} else {
			if (managersLowerPagination > 5) {
				managersLowerPagination -= 5;
				managersUpperPagination = managersLowerPagination + 4;
			} else {
				managersLowerPagination = 1;
				if (searchResults.length >= 5) {
					managersUpperPagination = 5;
				} else {
					managersUpperPagination = searchResults.length;
				}
			}

			managerPagination = searchResults.slice(managersLowerPagination - 1, managersUpperPagination);
		}
	}

	// Search query for managers
	var searchQuery = "",
		searchResults = null;
	// Search managers and set pagination on input
	async function SearchManager(event) {
		searchQuery = event.target.value.toLowerCase();
		if (searchQuery === "") {
			searchResults = null;

			if (managers.length >= 5) {
				managersUpperPagination = 5;
				managersLowerPagination = 1;
			} else {
				managersUpperPagination = managers.length;
				if (managersUpperPagination > 0) {
					managersLowerPagination = 1;
				} else {
					managersLowerPagination = 0;
				}
			}

			managerPagination = managers.slice(managersLowerPagination - 1, managersUpperPagination);
		} else {
			searchResults = managers.filter((manager) => {
				return manager.fullname[0].toLowerCase().includes(searchQuery);
			});

			if (searchResults.length >= 5) {
				managersUpperPagination = 5;
				managersLowerPagination = 1;
			} else {
				managersUpperPagination = searchResults.length;
				if (managersUpperPagination > 0) {
					managersLowerPagination = 1;
				} else {
					managersLowerPagination = 0;
				}
			}

			managerPagination = searchResults.slice(managersLowerPagination - 1, managersUpperPagination);
		}
	}

	// On submit, create a toast notification which will call the CreateProject function
	async function HandleSubmit(event) {
		event.preventDefault();
		try {
			const response = await axios.post("/project", {
				title: $title.value,
				description: $description.value,
				leader: $leaderId.value
			});
			const success = await response.data.success;
			const message = await response.data.message;
			if (success === true) {
				toast.success(message);
				await new Promise((resolve) => setTimeout(resolve, 3000));
				window.location.replace(`http://localhost:5173/admin/project/${response.data.project}`);
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
</script>

<section class="bg-transparent dark:bg-gray-900">
	<div class="py-2 px-4 mx-auto max-w-4xl lg:py-8">
		<h2 class="text-xl text-center font-bold text-gray-900 dark:text-white">Add new project</h2>
		<Toaster position="bottom-right" />
		<form on:submit={HandleSubmit} class="rounded-sm p-8">
			<div class="grid gap-4 sm:grid-cols-2 sm:gap-6">
				<div class="sm:col-span-2">
					<label for="title" class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
						>Project Title</label
					>
					<input
						bind:value={$title.value}
						type="text"
						name="title"
						class={`bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 ${$projectForm.hasError("title.required") ? "border-red-500 text-red-600 placeholder-red-600 focus:border-red-500 dark:border-red-500 dark:text-red-600 dark:placeholder-red-600 dark:focus:border-red-500" : ""}`}
						placeholder="Project title"
						required
					/>
					{#if $projectForm.hasError("title.required")}
						<p class="mt-2 text-base text-red-600 dark:text-red-500">Title is required</p>
					{/if}
				</div>
				<div class="sm:col-span-2">
					<label
						for="description"
						class="block mb-2 text-base font-bold text-gray-900 dark:text-white">Description</label
					>
					<textarea
						bind:value={$description.value}
						name="description"
						rows="5"
						class="block p-2.5 w-full text-base text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
						placeholder="Project description"
					></textarea>
				</div>
				<div class="sm:col-span-2">
					<label for="leader" class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
						>Project Leader</label
					>
					<input
						on:input={SearchManager}
						type="text"
						class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
						placeholder="Search Leader"
					/>

					<div class="relative overflow-x-auto shadow-md sm:rounded-lg mt-4">
						<table
							class="w-full text-sm text-left table-fixed rtl:text-right text-gray-500 dark:text-gray-400"
						>
							<thead
								class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
							>
								<tr>
									<th scope="col" class="px-6 py-3 w-[350px]"> Manager Name </th>
									<th scope="col" class="px-6 py-3 text-center"> Office </th>
									<th scope="col" class="px-6 py-3 text-center"> Department </th>
									<th scope="col" class="px-6 py-4 text-center"> Select </th>
								</tr>
							</thead>
							<tbody>
								{#if managerPagination != null}
									{#each managerPagination as manager}
										<tr
											class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
										>
											<th
												scope="row"
												class="flex items-center px-6 py-4 w-[350px] text-gray-900 whitespace-nowrap dark:text-white"
											>
												<!-- svelte-ignore a11y-img-redundant-alt -->
												<img
													class="w-10 h-10 rounded-full"
													src="/images/profile/{manager.profile_image}"
													alt="Profile image"
												/>
												<div class="ps-3">
													<div class="text-base font-semibold">{manager.fullname}</div>
													<div class="font-normal text-gray-500">{manager.email}</div>
												</div>
											</th>
											<td class="px-6 py-4 text-center"> {officeMapping[manager.office]} </td>
											<td class="px-6 py-4 text-center">
												{departmentMapping[manager.department]}
											</td>
											<td class="px-6 py-4 text-center">
												<button
													class="px-5 py-2.5 text-base font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
													on:click={(event) => {
														event.preventDefault();
														leaderId.set(manager._id);
														leaderName = manager.fullname;
													}}
												>
													Select
												</button>
											</td>
										</tr>
									{/each}
								{:else}
									<tr>
										<td colspan="4" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
											No managers found
										</td>
									</tr>
								{/if}
							</tbody>
						</table>
					</div>
					<div class="mb-4">
						<nav
							class="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4"
							aria-label="Table navigation"
						>
							<button
								class="flex items-center justify-center px-3 h-8 me-3 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
								on:click={PreviousPage}
							>
								<svg
									class="w-3.5 h-3.5 me-2 rtl:rotate-180"
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 14 10"
								>
									<path
										stroke="currentColor"
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 5H1m0 0 4 4M1 5l4-4"
									/>
								</svg>
								Previous
							</button>
							<span
								class="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto"
								>Showing <span class="font-semibold text-gray-900 dark:text-white">
									{managersLowerPagination == managersUpperPagination
										? managersLowerPagination
										: managersLowerPagination + "-" + managersUpperPagination}
								</span>
								of
								<span class="font-semibold text-gray-900 dark:text-white"
									>{searchResults != null
										? searchResults.length
										: managers == null
											? 0
											: managers.length}</span
								></span
							>
							<button
								class="flex items-center justify-center px-3 h-8 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
								on:click={NextPage}
							>
								Next
								<svg
									class="w-3.5 h-3.5 ms-2 rtl:rotate-180"
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 14 10"
								>
									<path
										stroke="currentColor"
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M1 5h12m0 0L9 1m4 4L9 9"
									/>
								</svg>
							</button>
						</nav>
					</div>

					<input
						bind:value={leaderName}
						type="text"
						name="leader"
						class={`bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
						placeholder="Selected Leader"
						readonly
						disabled
					/>
				</div>
			</div>
			<div class="flex justify-center">
				<button
					type="submit"
					on:click={projectForm.validate}
					disabled={$projectForm.valid ? false : true}
					class="px-5 py-2.5 mt-4 mr-2 sm:mt-6 text-base font-medium text-center text-white bg-green-700 rounded-lg focus:ring-4 focus:ring-green-200 dark:focus:ring-green-900 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Add project
				</button>
				<a href="../project" class="hover:no-underline">
					<button
						class="px-5 py-2.5 mt-4 ml-2 sm:mt-6 text-base font-medium text-center text-white bg-red-700 rounded-lg focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900 hover:bg-red-800"
					>
						Cancel
					</button>
				</a>
			</div>
		</form>
	</div>
</section>
