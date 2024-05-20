<script>
	import { onMount } from "svelte";
	import {
		officeMapping,
		departmentMapping,
		positionMapping,
		genderMapping,
		stateMapping
	} from "$lib/mappings/mappings.js";
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
	import toast, { Toaster } from "svelte-french-toast";

	//Get Id from +page.server.js
	export let data;

	var UserInforID = data.props.employee?.userinfor?._id,
		GetEmployeeID = data.props.employee?._id,
		GetAccountID = data.props.employee?.account?._id,
		authorizations = data.props.authorizations,
		managers = data.props.managers,
		GetManagerFullName = data.props.employee?.manager_userinfor?.fullname,
		profile_image = data.props.employee?.userinfor?.profile_image,
		fullname = data.props.employee?.userinfor?.fullname,
		office = data.props.employee?.userinfor?.office?.toString(),
		department = data.props.employee?.userinfor?.department?.toString(),
		position = data.props.employee?.userinfor?.position?.toString(),
		manager_id = data.props.employee?.userinfor?.manager_id,
		email = data.props.employee?.userinfor?.email,
		address = data.props.employee?.userinfor?.address,
		gender = data.props.employee?.userinfor?.gender?.toString(),
		phone = data.props.employee?.userinfor?.phone,
		username = data.props.employee?.account?.username,
		account_name = data.props.employee?.account?.account_name,
		selectedAccountAuthorizationID = data.props.employee?.account?.account_authorization_id,
		state = data.props.employee?.userinfor?.state?.toString(),
		managerSearch = managers;

	// Create FormData for image file
	var image_file,
		showManager,
		showOffice,
		positionSelect = positionMapping,
		ShowImage;

	async function ResetPassword(event) {
		event.preventDefault();
		if(window.confirm("Are you sure you want to reset password?\nThis action is irreversible!")){

			try {
				var response = await axios.get(`/reset-password/${GetAccountID}`);
				if (response.data.success === true) {
					toast.success(response.data.message);
				} else {
					toast.error(response.data.message);
				}
			} catch (error) {
				console.error(error);
				toast.error("Something went wrong. Please try again later.");
			}
		}
	}

	function SearchManager(event) {
		if (event.target.value === "") {
			managerSearch = managers;
		} else {
			if (managers != null) {
				managerSearch = managers.filter((manager) => {
					return manager.fullname.toLowerCase().includes(event.target.value.toLowerCase());
				});
			}
		}
	}

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

	async function UpdateEmployee() {
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
				formData.append("generateFilePath", false);
				formData.append("modifyPath", profile_image);

				// Upload file
				response = await fetch("/api/uploadFile", {
					method: "POST",
					body: formData
				});
				response = await response.json();

				// If upload fails, cancel operation
				if (response.success !== true) {
					toast.error("Upload file failed");
					return;
				}
			}

			response = await axios.put(`/update-employee`, {
				userInforId: UserInforID,
				accountId: GetAccountID,
				employeeId: GetEmployeeID,
				username: username,
				account_name: account_name,
				account_authorization_id: selectedAccountAuthorizationID,
				fullname: fullname,
				office: office,
				department: department,
				position: position,
				state: state,
				managerId: manager_id,
				email: email,
				gender: gender,
				phone: phone,
				address: address
			});

			if (response.data.success === true) {
				toast.success(response.data.message);
			} else {
				toast.error(response.data.message);
			}
		}
	}

	async function InitSelects() {
		switch (department) {
			case "0":
				positionSelect = Object.fromEntries(
					Object.entries(positionMapping).filter(
						([key, value]) => key === "0" || key === "1" || key === "2"
					)
				);
				break;
			case "1":
				positionSelect = Object.fromEntries(
					Object.entries(positionMapping).filter(([key, value]) => key === "3" || key === "4")
				);
				break;
			case "2":
				positionSelect = Object.fromEntries(
					Object.entries(positionMapping).filter(
						([key, value]) => key === "4" || key === "5" || key === "6"
					)
				);
				break;
			case "3":
				positionSelect = Object.fromEntries(
					Object.entries(positionMapping).filter(([key, value]) => key === "7")
				);
				break;
		}

		if (position === "0") {
			showManager = false;
			showOffice = true;
		} else if (position === "-1") {
			showManager = false;
			showOffice = false;
		} else {
			showManager = true;
			showOffice = true;
		}

		var selectedAuthorization = authorizations.filter(
			(a) => a.Id === selectedAccountAuthorizationID
		)[0].LevelName;
		if (selectedAuthorization === "Director") {
			showManager = false;
			showOffice = true;
		} else if (selectedAuthorization === "Customer") {
			showManager = false;
			showOffice = false;
		} else {
			showManager = true;
			showOffice = true;
		}
	}

	onMount(InitSelects);
	import Breadcrumb from "$lib/components/Breadcrumb/AdminBreadcrumb.svelte";
	let image_picker;
</script>

<Toaster position="bottom-right" />

<Breadcrumb depth="auth/accounts/user-infor-update" />
<div class="-ml-16 sm:ml-5 mt-0 z-0 h-fit bg-base-100 rounded-md p-5 rounded-tl-none">
	<h1 class="prose mb-3 font-bold text-2xl sm:text-3xl text-left w-auto">Update information</h1>
	<form
		method="post"
		on:submit|preventDefault={UpdateEmployee}
		enctype="multipart/form-data"
		class="rounded-sm"
	>
		<div class="grid grid-flow-row items-center md:gap-4 sm:px-52">
			<button
				class="relative col-span-2 justify-self-center outline-none rounded-full hover:outline-cyan-400 transition-all overflow-hidden"
				on:click={() => image_picker.click()}
			>
				<p
					class="flex justify-center items-center flex-col prose font-medium absolute bg-slate-100 size-24 rounded-full px-1 py-5 text-xs opacity-0 hover:opacity-100 transition-all"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						fill="currentColor"
						class="bi bi-pencil-square"
						viewBox="0 0 16 16"
					>
						<path
							d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"
						/>
						<path
							fill-rule="evenodd"
							d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
						/>
					</svg>
					Click to upload image
				</p>
				<!-- added nicer image picker, not aria friendly -->
				{#if ShowImage}
					<!-- svelte-ignore a11y-img-redundant-alt -->
					<img src={ShowImage} alt="Selected Image" class="size-24 rounded-full" />
				{:else if profile_image != null}
					<!-- svelte-ignore a11y-img-redundant-alt -->
					<img
						src="/images/profile/{profile_image}"
						alt="Profile Image"
						class="size-24 rounded-full"
					/>
				{:else}
					<!-- svelte-ignore a11y-img-redundant-alt -->
					<img
						src="/images/profile/profile_image_default.jpg"
						alt="Profile Image"
						class="size-24 rounded-full"
					/>
				{/if}
				<input
					type="file"
					id="file"
					name="file"
					class="hidden"
					on:change={HandleUploadImage}
					bind:this={image_picker}
				/>
			</button>
			<input bind:value={UserInforID} type="hidden" name="userInforId" readonly />
			<input bind:value={GetAccountID} type="hidden" name="accountId" readonly />
			<input bind:value={GetEmployeeID} type="hidden" name="employeeId" readonly />
			<input value={profile_image} type="hidden" name="defaultImage" readonly />

			<div>
				<label for="title" class="block mb-2 text-base font-bold">Username</label>
				<input
					bind:value={username}
					type="text"
					name="username"
					class="input input-bordered w-full bg-white focus:outline-green-500"
					placeholder="Username"
					required
				/>
			</div>
			<div>
				<label for="title" class="block mb-2 text-base font-bold">Account name</label>
				<input
					bind:value={account_name}
					type="text"
					name="accountName"
					class="input input-bordered w-full bg-white focus:outline-green-500"
					placeholder="Account Name"
					required
				/>
			</div>
			<div>
				<label for="title" class="block mb-2 text-base font-bold">Authorization Level</label>
				<select
					bind:value={selectedAccountAuthorizationID}
					on:change={HandleChangeAuthorization}
					class="select select-bordered w-full bg-white focus:outline-green-500"
				>
					<option value="" disabled>Select an authorization level</option>
					{#each authorizations as item}
						<option value={item.Id}>{item.LevelName}</option>
					{/each}
				</select>
				<input
					type="hidden"
					bind:value={selectedAccountAuthorizationID}
					name="selectedAccountLevel"
					readonly
				/>
			</div>
			<div>
				<label for="title" class="block mb-2 text-base font-bold">Full Name</label>
				<input
					bind:value={fullname}
					type="text"
					name="fullName"
					class="input input-bordered w-full bg-white focus:outline-green-500"
					placeholder="Full Name"
					required
				/>
			</div>
			{#if showOffice === true}
				<div>
					<label for="office" class="block mb-2 text-base font-bold">Office</label>
					<select
						bind:value={office}
						class="select select-bordered w-full bg-white focus:outline-green-500"
					>
						<option value="" disabled>--- Select an office ---</option>
						{#each Object.entries(officeMapping) as [value, label]}
							<option {value}>{label}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="title" class="block mb-2 text-base font-bold">Department</label>
					<select
						bind:value={department}
						on:change={HandleChangeDepartment}
						class="select select-bordered w-full bg-white focus:outline-green-500"
					>
						<option value="" disabled>--- Select a department ---</option>
						{#each Object.entries(departmentMapping) as [value, label]}
							<option {value}>{label}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="title" class="block mb-2 text-base font-bold">Position</label>
					<select
						bind:value={position}
						on:change={HandleChangePosition}
						class="select select-bordered w-full bg-white focus:outline-green-500"
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
			<div>
				<label for="title" class="block mb-2 text-base font-bold">Working State</label>
				<select
					bind:value={state}
					class="select select-bordered w-full bg-white focus:outline-green-500"
				>
					<option value="" disabled>--- Select a working state ---</option>
					{#each Object.entries(stateMapping) as [value, label]}
						<option {value}>{label}</option>
					{/each}
				</select>
				<input bind:value={state} type="hidden" name="state" readonly />
			</div>
			{#if showManager === true}
				<div class=" col-span-2">
					<label for="leader" class="block mb-2 text-base font-bold">Manager</label>
					<input
						on:input={SearchManager}
						type="text"
						class="input input-bordered w-full bg-white focus:outline-green-500"
						placeholder="Search Leader"
					/>

					<div class="relative overflow-x-auto shadow-md sm:rounded-lg mt-4">
						<table class="w-full text-sm text-left table-fixed rtl:text-right text-pretty">
							<thead class="text-xs text-gray-700 uppercase bg-gray-50">
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
										<tr class="bg-white border-b hover:bg-gray-200">
											<th
												scope="row"
												class="flex items-center px-6 py-4 w-[350px] whitespace-nowrap"
											>
												<img
													class="size-12 rounded-full"
													src="/images/profile/{manager?.profile_image}"
													alt="Manager avatar"
												/>

												<div class="ps-3">
													<div class="text-base font-semibold">{manager?.fullname}</div>
													<div class="font-normal text-pretty">{manager?.email}</div>
												</div>
											</th>
											<td class="px-6 py-4 text-center"> {officeMapping[manager?.office]} </td>
											<td class="px-6 py-4 text-center">
												{departmentMapping[manager?.department]}
											</td>
											<td class="px-6 py-4 text-center">
												<button
													class="btn btn-sm h-9 btn-info font-medium"
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
									<tr class="bg-white border-b hover:bg-gray-50">
										<td colspan="4" class="px-6 py-4 text-center"> No manager found. </td>
									</tr>
								{/if}
							</tbody>
						</table>
					</div>
				</div>
				<div>
					<label for="title" class="block mb-2 text-base font-bold">Selected Manager</label>
					<input
						bind:value={GetManagerFullName}
						type="text"
						name="manager_full_name"
						class="input input-bordered w-full bg-white focus:outline-green-500"
						placeholder="Manager Full Name"
						readonly
					/>
				</div>
			{/if}
			<input bind:value={manager_id} type="hidden" name="manager_id" readonly />
			<div>
				<label for="title" class="block mb-2 text-base font-bold">Email</label>
				<input
					bind:value={email}
					type="email"
					name="email"
					class="input input-bordered w-full bg-white focus:outline-green-500"
					placeholder="Email"
				/>
			</div>
			<div>
				<label for="title" class="block mb-2 text-base font-bold">Gender</label>
				<select
					bind:value={gender}
					class="select select-bordered w-full bg-white focus:outline-green-500"
				>
					<option value="" disabled>--- Select a gender ---</option>
					{#each Object.entries(genderMapping) as [value, label]}
						<option {value}>{label}</option>
					{/each}
				</select>
				<input bind:value={gender} type="hidden" name="gender" readonly />
			</div>
			<div>
				<label for="title" class="block mb-2 text-base font-bold">Phone</label>
				<input
					bind:value={phone}
					type="text"
					name="phone"
					class="input input-bordered w-full bg-white focus:outline-green-500"
					placeholder="Phone"
				/>
			</div>
			<div>
				<label for="title" class="block mb-2 text-base font-bold">Address</label>
				<input
					bind:value={address}
					type="text"
					name="address"
					class="input input-bordered w-full bg-white focus:outline-green-500"
					placeholder="Adress"
				/>
			</div>
			<div class="sm:col-span-2 flex justify-end space-between gap-4 mt-10">
				<button type="submit" class="btn btn-primary btn-sm h-11 w-40"> Update account </button>
				<button on:click|preventDefault={ResetPassword} class="btn btn-error text-white btn-sm h-11 w-40">
					Reset password
				</button>
				<a href="../auth/accounts" class="hover:no-underline">
					<button class="btn btn-sm h-11 w-40"> Cancel </button>
				</a>
			</div>
		</div>
	</form>
</div>
