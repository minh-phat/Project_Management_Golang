<script>
	import {
		officeMapping,
		departmentMapping,
		positionMapping,
		genderMapping
	} from "$lib/mappings/mappings.js";
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

	export let data;

	var selectedAccountLevel = data.props.authorizations[0].Id; // Variable to hold the selected option
	var authorizations = data.props.authorizations; // Initialize an empty array to store the JSON data
	var managers = data.props.managers; // Initialize an empty array to store the managers in the system
	var managerSearch = managers;
	var positionSelect = (positionSelect = Object.fromEntries(
		Object.entries(positionMapping).filter(
			([key, value]) => key === "0" || key === "1" || key === "2"
		)
	));

	var GetManagerFullName;
	var gender = "0",
		username="",
		accountName="",
		fullName="",
		office = "0",
		department = "0",
		position = "0",
		manager_id="",
		email="",
		phone="",
		address="",
		showManager = false,
		showOffice = true;

	//Get image and show image
	let ShowImage, image_file;
	async function HandleUploadImage(event) {
		event.preventDefault();

		//Get image when selected file in local
		image_file = event.target.files[0];

		//show image when selected
		if (image_file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				ShowImage = e.target.result;
			};
			reader.readAsDataURL(image_file);
		}
	}

	function HandleChangeDepartment(event) {
		var department = event.target.value;

		switch (department) {
			case "0":
				positionSelect = Object.fromEntries(
					Object.entries(positionMapping).filter(
						([key, value]) => key === "0" || key === "1" || key === "2"
					)
				);
				position = "0";
				showManager = false;
				break;
			case "1":
				positionSelect = Object.fromEntries(
					Object.entries(positionMapping).filter(([key, value]) => key === "3" || key === "4")
				);
				position = "3";
				showManager = true;
				break;
			case "2":
				positionSelect = Object.fromEntries(
					Object.entries(positionMapping).filter(
						([key, value]) => key === "4" || key === "5" || key === "6"
					)
				);
				position = "4";
				showManager = true;
				break;
			case "3":
				positionSelect = Object.fromEntries(
					Object.entries(positionMapping).filter(([key, value]) => key === "7")
				);
				position = "7";
				showManager = true;
				break;
		}
	}

	function HandleChangePosition(event) {
		var position = event.target.value;
		if (position === "0") {
			showManager = false;
		} else {
			showManager = true;
		}
	}

	function HandleChangeAuthorization(event) {
		var selectedLevel = authorizations.find((auth) => auth.Id === event.target.value).LevelName;
		if (selectedLevel === "Director") {
			showManager = false;
			showOffice = true;
			department = "0";
			position = "0";
		} else if (selectedLevel === "Customer") {
			showManager = false;
			showOffice = false;
			office = "";
			department = "";
			position = "";
		} else {
			showManager = true;
			showOffice = true;
		}
	}

	function SearchManager(event) {
		if (event.target.value === "") {
			managerSearch = managers;
		} else {
			managerSearch = managers.filter((manager) => {
				return manager.fullname.toLowerCase().includes(event.target.value.toLowerCase());
			});
		}
	}

	async function CreateEmployee() {
		var profileImage;
		var response = await axios.get("isAuthorized");
		if (response.data.success === true) {
			if (
				image_file &&
				image_file?.name !== undefined &&
				image_file?.name !== null &&
				image_file?.name !== ""
			) {
				// Prepare data for each file to upload
				const formData = new FormData();
				formData.append("file", image_file);
				formData.append("folderPath", "/images/profile");
				formData.append("generateFilePath", true);

				// Upload file
				response = await fetch("/api/uploadFile", {
					method: "POST",
					body: formData
				});
				response = await response.json();

				// If upload succeeds, add file path to array
				if (response.success === true) {
					profileImage = response.filePath;
				} else {
					// Otherwise, show notification and return
					toast.error("Upload file failed");
					return;
				}
			} else {
				profileImage = "profile_image_default.jpg";
			}

			// If all files are uploaded successfully, insert record into database
			if (profileImage !== null && profileImage !== "") {
				response = await axios.post("/create-employee", {
						profile_image: profileImage,
						username: username,
						account_name: accountName,
						account_authorization_id: selectedAccountLevel,
						fullname: fullName,
						office: office,
						department: department,
						position: position,
						manager_id: manager_id,
						email: email,
						gender: gender,
						phone: phone,
						address: address
					}
				);

				if (response.data.success === true) {
					toast.success(response.data.message);
				} else {
					toast.error(response.data.message);
				}
			} else {
				toast.error("Error occurred while uploading profile image. Please try again later.");
			}
		}
	}
</script>

<Toaster position="bottom-right" />

<div class="py-2 px-4 mx-auto max-w-4xl lg:py-8">
	<form
		method="post"
		on:submit|preventDefault={CreateEmployee}
		enctype="multipart/form-data"
		class="rounded-sm p-8"
	>
		<h2 class="text-xl text-center font-bold text-gray-900 dark:text-white">Add new Employee</h2>
		<div class="grid max-w-2xl mx-auto mt-8">
			<div class="flex flex-col items-center space-y-5 sm:flex-row sm:space-y-0">
				{#if ShowImage}
					<img class="w-64 h-64 rounded-full" src={ShowImage} alt="Bordered avatar" />
				{:else}
					<img
						class="w-64 h-64 rounded-full"
						src="/images/profile/profile_image_default.jpg"
						alt="Bordered avatar"
					/>
				{/if}

				<div class="flex flex-col space-y-5 sm:ml-8">
					<input
						type="file"
						id="file"
						name="file"
						class="py-3.5 px-7 text-base font-medium text-indigo-100 focus:outline-none bg-[#202142] rounded-lg border border-indigo-200 hover:bg-indigo-900 focus:z-10 focus:ring-4 focus:ring-indigo-200"
						on:change={HandleUploadImage}
					/>
				</div>
			</div>
		</div>
		<div class="grid gap-4 sm:grid-cols-2 sm:gap-6">
			<div class="sm:col-span-2">
				<label for="title" class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
					>Username</label
				>
				<input
					bind:value={username}
					type="text"
					name="username"
					class={`bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 `}
					placeholder="Username"
					required
				/>
			</div>
			<div class="sm:col-span-2">
				<label for="title" class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
					>Account name</label
				>
				<input
					bind:value={accountName}
					type="text"
					name="accountName"
					class={`bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
					placeholder="Account Name"
					required
				/>
			</div>
			<div class="sm:col-span-2">
				<label for="title" class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
					>Authorization Level</label
				>
				<select
					bind:value={selectedAccountLevel}
					on:change={HandleChangeAuthorization}
					class="px-3 py-1.5 w-full inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
				>
					<option value="" disabled>--- Select an authorization level ---</option>
					{#each authorizations as item}
						<option value={item.Id}>{item.LevelName}</option>
					{/each}
				</select>
				<input
					type="hidden"
					bind:value={selectedAccountLevel}
					name="selectedAccountLevel"
					readonly
				/>
			</div>
			<div class="sm:col-span-2">
				<label for="title" class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
					>Full Name</label
				>
				<input
					bind:value={fullName}
					type="text"
					name="fullName"
					class={`bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
					placeholder="Full Name"
					required
				/>
			</div>
			{#if showOffice === true}
				<div class="sm:col-span-2">
					<label for="office" class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
						>Office</label
					>
					<select
						bind:value={office}
						class="px-3 py-1.5 w-full inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
					>
						<option value="" disabled>--- Select a office ---</option>
						{#each Object.entries(officeMapping) as [value, label]}
							<option {value}>{label}</option>
						{/each}
					</select>
				</div>
				<div class="sm:col-span-2">
					<label for="title" class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
						>Department</label
					>
					<select
						on:change={HandleChangeDepartment}
						bind:value={department}
						class="px-3 py-1.5 w-full inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
					>
						<option value="" disabled>--- Select a department ---</option>
						{#each Object.entries(departmentMapping) as [value, label]}
							<option {value}>{label}</option>
						{/each}
					</select>
				</div>
				<div class="sm:col-span-2">
					<label for="title" class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
						>Position</label
					>
					<select
						bind:value={position}
						on:change={HandleChangePosition}
						class="px-3 py-1.5 w-full inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
					>
						<option value="" disabled>--- Select a position ---</option>
						{#each Object.entries(positionSelect) as [value, label]}
							<option {value}>{label}</option>
						{/each}
					</select>
				</div>
			{/if}
			<input bind:value={office} type="hidden" name="office" readonly />
			<input bind:value={department} type="hidden" name="department" readonly />
			<input bind:value={position} type="hidden" name="position" readonly />
			{#if showManager === true}
				<div class="sm:col-span-2">
					<label for="manager" class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
						>Manager</label
					>
					<input
						on:input={SearchManager}
						type="text"
						class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
						placeholder="Search Manager"
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
								{#if managerSearch !== null && managerSearch.length > 0}
									{#each managerSearch as manager}
										<tr
											class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
										>
											<th
												scope="row"
												class="flex items-center px-6 py-4 w-[350px] text-gray-900 whitespace-nowrap dark:text-white"
											>
												<img
													class="w-10 h-10 rounded-full"
													src="/images/profile/{manager?.profile_image}"
													alt="Manager avatar"
												/>

												<div class="ps-3">
													<div class="text-base font-semibold">{manager?.fullname}</div>
													<div class="font-normal text-gray-500">{manager?.email}</div>
												</div>
											</th>
											<td class="px-6 py-4 text-center"> {officeMapping[manager?.office]} </td>
											<td class="px-6 py-4 text-center">
												{departmentMapping[manager?.department]}
											</td>
											<td class="px-6 py-4 text-center">
												<button
													class="px-5 py-2.5 text-base font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
													on:click={(event) => {
														event.preventDefault();
														manager_id = manager?._id;
														GetManagerFullName = manager.fullname;
													}}
												>
													Select
												</button>
											</td>
										</tr>
									{/each}
								{:else}
									<tr
										class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
									>
										<td colspan="4" class="px-6 py-4 text-center"> No manager found. </td>
									</tr>
								{/if}
							</tbody>
						</table>
					</div>
				</div>
				<div class="sm:col-span-2">
					<label for="title" class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
						>Selected Manager</label
					>
					<input
						bind:value={GetManagerFullName}
						type="text"
						name="manager_full_name"
						class={`bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
						placeholder="Manager Full Name"
						readonly
					/>
				</div>
			{/if}
			<input bind:value={manager_id} type="hidden" name="manager_id" readonly />
			<div class="sm:col-span-2">
				<label for="title" class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
					>Email</label
				>
				<input
					bind:value={email}
					type="email"
					name="email"
					class={`bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
					placeholder="Email"
				/>
			</div>
			<div class="sm:col-span-2">
				<label for="title" class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
					>Gender</label
				>
				<select
					bind:value={gender}
					class="px-3 py-1.5 w-full inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
				>
					<option value="" disabled>--- Select a gender ---</option>
					{#each Object.entries(genderMapping) as [value, label]}
						<option {value}>{label}</option>
					{/each}
				</select>
				<input bind:value={gender} type="hidden" name="gender" readonly />
			</div>
			<div class="sm:col-span-2">
				<label for="title" class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
					>Phone</label
				>
				<input
					bind:value={phone}
					type="phone"
					name="phone"
					class={`bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
					placeholder="Phone"
				/>
			</div>
			<div class="sm:col-span-2">
				<label for="title" class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
					>Address</label
				>
				<input
					bind:value={address}
					type="text"
					name="address"
					class={`bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
					placeholder="Adress"
				/>
			</div>
			<div class="flex justify-center">
				<button
					type="submit"
					class="px-5 py-2.5 mt-4 mr-2 sm:mt-6 text-base font-medium text-center text-white bg-green-700 rounded-lg focus:ring-4 focus:ring-green-200 dark:focus:ring-green-900 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Add new account
				</button>
				<a href="./view-employees" class="hover:no-underline">
					<button
						class="px-5 py-2.5 mt-4 ml-2 sm:mt-6 text-base font-medium text-center text-white bg-red-700 rounded-lg focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900 hover:bg-red-800"
					>
						Cancel
					</button>
				</a>
			</div>
		</div>
	</form>
</div>
