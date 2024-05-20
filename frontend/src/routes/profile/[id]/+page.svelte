<script>
	import toast, { Toaster } from "svelte-french-toast";
	import axios from "axios";
	import { onMount } from "svelte";
	import { error } from "@sveltejs/kit";
	import {
		officeMapping,
		departmentMapping,
		positionMapping,
		genderMapping,
		stateMapping
	} from "$lib/mappings/mappings.js";
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

	//Get Id from +page.server.js
	export let data;

	var employee = data.employee;
	var currentUser = data.currentUser;
	var authorization = data.authorization;
	var userinforId,
		accountId,
		username,
		accountName,
		profileImage,
		fullname,
		office,
		department,
		position,
		state,
		manager,
		email,
		address,
		gender,
		phone,
		ShowImage,
		editToggle = false,
		imageFile,
		loading = true,
		oldPW,
		newPW,
		reNewPW,
		changePWError;

	onMount(GetAllData);

	async function GetAllData() {
		if (currentUser._id === employee._id) {
			userinforId = employee?.userinfor?._id;
			accountId = employee?.account?._id;
			username = employee?.account?.username;
			accountName = employee?.account?.account_name;
			profileImage = employee?.userinfor?.profile_image;
			fullname = employee?.userinfor?.fullname;
			office = employee?.userinfor?.office.toString();
			department = employee?.userinfor?.department.toString();
			position = employee?.userinfor?.position.toString();
			state = employee?.state.toString();
			manager = employee?.manager_userinfor?.fullname;
			email = employee?.userinfor?.email;
			address = employee?.userinfor?.address;
			gender = employee?.userinfor?.gender.toString();
			phone = employee?.userinfor?.phone;

			loading = false;
		} else {
			throw error(401, {
				message: "You are unauthorized to access this resource."
			});
		}
	}

	async function ChangePassword() {
		if (
			oldPW === undefined ||
			oldPW === "" ||
			newPW === undefined ||
			newPW === "" ||
			reNewPW === undefined ||
			reNewPW === ""
		) {
			changePWError = "*Please fill in all fields";
		} else if (newPW !== reNewPW) {
			changePWError = "*New password and repeat new password do not match";
		} else {
			try {
				var response = await axios.post(`/change-password/${accountId}`, {
					old_password: oldPW,
					new_password: newPW,
					renew_password: reNewPW
				});
				if (response.data.success === true) {
					toast.success(response.data.message);
					oldPW = "";
					newPW = "";
					reNewPW = "";
					changePWError = "";
				}
			} catch (error) {
				changePWError = error.response.data.message;
				toast.error(error.response.data.message);
			}
		}
	}

	async function HandleUploadImage(event) {
		event.preventDefault();
		//Get image when selected file in local
		imageFile = event.target.files[0];
		//show image when selected
		if (imageFile) {
			const reader = new FileReader();
			reader.onload = (e) => {
				ShowImage = e.target.result;
			};
			reader.readAsDataURL(imageFile);
			editToggle = true;
		}
	}

	async function UpdateUserInfor() {
		var response = await axios.get("isAuthorized");
		if (response.data.success === true) {
			if (
				imageFile &&
				imageFile?.name !== undefined &&
				imageFile?.name !== null &&
				imageFile?.name !== ""
			) {
				// // Prepare data for each file to upload
				const formData = new FormData();
				formData.append("file", imageFile);
				formData.append("folderPath", "/images/profile");
				if (employee.userinfor.profile_image === "profile_image_default.jpg") {
					formData.append("generateFilePath", true);
				} else {
					formData.append("generateFilePath", false);
					formData.append("modifyPath", employee.userinfor.profile_image);
				}

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

			var filePath;

			if (employee.userinfor.profile_image === "profile_image_default.jpg") {
				filePath = response.filePath;
				response = await axios.put(`/user-infor-update/${userinforId}`, {
					fullname: fullname,
					email: email,
					phone: phone,
					gender: parseInt(gender),
					address: address,
					profile_image: filePath
				});
			} else {
				response = await axios.put(`/user-infor-update/${userinforId}`, {
					fullname: fullname,
					email: email,
					phone: phone,
					gender: parseInt(gender),
					address: address,
					profile_image: ""
				});
			}

			if (response.data.success === true) {
				toast.success(response.data.message);
				editToggle = false;
			} else {
				toast.error(response.data.message);
			}
		}
	}
</script>

<Toaster position="bottom-right" />

{#if loading === false}
	<div class=" -ml-16 sm:ml-5 p-0 mt-5 z-0 text-neutral">
		<div
			class="Content mr-2 w-full sm:mr z-0 h-auto bg-base-100 rounded-md p-5 flex flex-col gap-x-5 sm:flex-row sm:justify-normal"
		>
			<div class="mugshot flex flex-row sm:flex-col flex-shrink-0 w-36">
				<label for="file">
					{#if ShowImage}
						<img
							src={ShowImage}
							alt="Selected"
							class="rounded-md border-neutral border size size-24 sm:size-auto"
						/>
					{:else if profileImage !== null}
						<img
							src="/images/profile/{profileImage}"
							alt="Profile"
							class="rounded-md border-neutral border size size-24 sm:size-auto"
						/>
					{/if}
				</label>
				<input
					id="file"
					name="file"
					type="file"
					class="hidden"
					accept=".jpg,.png,.jpeg"
					on:change={HandleUploadImage}
				/>
				<div class="ml-2 sm:ml-0">
					<p class=""><strong>Member since</strong> {employee.createdAt}</p>
				</div>
			</div>
			<div class="information ml-0 font-light">
				<div class="flex flex-row justify-between">
					<h1 class="text-xl font-semibold sm:mt-0 mt-5">About</h1>
					{#if editToggle === false}
						<button class="btn btn-sm" on:click={() => (editToggle = true)}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
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
						</button>
					{:else}
						<button
							class="btn btn-sm btn-primary"
							on:click={() => {
								editToggle = false;
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								fill="currentColor"
								class="bi bi-check-lg"
								viewBox="0 0 16 16"
							>
								<path
									d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"
								/>
							</svg>
						</button>
					{/if}
				</div>
				<div class="divider -my-1 divider-neutral"></div>
				{#if editToggle === true}
					<p class="flex">
						<strong class="shrink-0 mr-2">Full name:</strong><input
							type="text"
							class="input input-sm input-bordered w-full text-right"
							bind:value={fullname}
						/>
					</p>
					<p class="flex mt-2">
						<strong class="shrink-0 mr-2">Email:</strong><input
							type="text"
							class="input input-sm input-bordered w-full text-right"
							bind:value={email}
						/>
					</p>
					<p class="flex mt-2">
						<strong class="shrink-0 mr-2">Phone:</strong><input
							type="text"
							class="input input-sm input-bordered w-full text-right"
							bind:value={phone}
						/>
					</p>
					<p class="flex mt-2">
						<strong class="shrink-0 mr-2">Gender:</strong>
						<select
							bind:value={gender}
							class="px-3 py-1.5 w-full text-right inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
						>
							<option value="" disabled>--- Select an office ---</option>
							{#each Object.entries(genderMapping) as [value, label]}
								<option {value}>{label}</option>
							{/each}
						</select>
						<input bind:value={gender} type="hidden" name="gender" readonly />
					</p>
					<p class="flex mt-2">
						<strong class="shrink-0 mr-2">Adress:</strong><input
							type="text"
							class="input input-sm input-bordered w-full text-right"
							bind:value={address}
						/>
					</p>
					<button
						dir="ltr"
						class="btn btn-primary font-normal text-sm btn-sm mt-2 mr-0 ml-auto w-3/5"
						on:click|preventDefault={UpdateUserInfor}>Update</button
					>
				{:else}
					<p><strong>Full name:</strong> {fullname}</p>
					<p><strong>Email:</strong> {email}</p>
					<p><strong>Phone:</strong> {phone}</p>
					<p><strong>Gender:</strong> {genderMapping[gender]}</p>
					<p><strong>Adress:</strong> {address}</p>
				{/if}
				<div class="divider my-0"></div>
				<p><strong>Office:</strong> {officeMapping[office]}</p>
				<p><strong>Role:</strong> {authorization}</p>
				<p><strong>Department:</strong> {departmentMapping[department]}</p>
				<p><strong>Position:</strong> {positionMapping[position]}</p>
				<p><strong>Manager:</strong> {manager}</p>
				<p><strong>State:</strong> {stateMapping[state]}</p>
			</div>
			<div class="information flex-row ml-0 flex font-light">
				<div class="information w-full">
					<h1 class="text-xl font-semibold sm:mt-0 mt-5 mb-1">Account</h1>
					<div class="divider -my-1 divider-neutral"></div>
					<p><strong>Username:</strong> {username}</p>
					<p><strong>Account name:</strong> {accountName}</p>
					<form class="flex flex-col">
						<label for="old_password">Password:</label>
						<input type="password" class="input h-8 input-bordered w-full" bind:value={oldPW} />
						<label for="password">New password:</label>
						<input type="password" class="input h-8 input-bordered w-full" bind:value={newPW} />
						<label for="re-new_password">Repeat new password:</label>
						<input type="password" class="input h-8 input-bordered w-full" bind:value={reNewPW} />
						{#if changePWError !== undefined && changePWError !== ""}
							<p class="text-red-500 text-right">{changePWError}</p>
						{/if}
						<button
							dir="ltr"
							class="btn btn-primary font-normal text-sm btn-sm mt-2 mr-0 ml-auto w-3/5"
							on:click|preventDefault={ChangePassword}>Change Password</button
						>
					</form>
				</div>
			</div>
		</div>
	</div>
{/if}
