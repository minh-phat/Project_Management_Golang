<script>
	import toast, { Toaster } from "svelte-french-toast";
	import { officeMapping, departmentMapping } from "$lib/mappings/mappings.js";
	import Breadcrumb from "$lib/components/Breadcrumb/AdminBreadcrumb.svelte";
	import axios from "axios";

	import { DateInput } from 'date-picker-svelte'

	let taskEndDate = new Date();
	let taskCreatedDate = new Date();
	//Set the maximum time selected in the calendar
	let maxDateSelectedInCalender = new Date("3000-1-1 00:00:00");

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
	var GetEpicID = data.EpicID;
	var employees = data.employees;
	var epic = data.epic;
	var project = data.project;
	var employeesSearch = employees;
	var members = [];
	var title,
		status = "To Do",
		description,
		note,
		files;

	async function CreateTask(event) {
		event.preventDefault();

		var filePaths = [];
		var members_id = [];
		if (members !== null && members.length > 0) {
			members.forEach((item) => {
				members_id.push(item.id);
			});
		}
		var response = await axios.get("isAuthorized");
		response = response.data;
		if (response.success === true) {
			if (files !== null && files !== undefined && files.length > 0) {
				for (let i = 0; i < files.length; i++) {
					// Prepare data for each file to upload
					const formData = new FormData();
					formData.append("file", files[i]);
					formData.append("folderPath", "/attachments");
					formData.append("generateFilePath", true);

					// Upload file
					response = await fetch("/api/uploadFile", {
						method: "POST",
						body: formData
					});
					response = await response.json();

					// If upload succeeds, add file path to array
					if (response.success === true) {
						filePaths.push(response.filePath);
					} else {
						break;
					}
				}
			}

			// If all files are uploaded successfully, insert record into database
			if (response.success === true) {
				var response = await axios.post("/task", {
					epic: GetEpicID,
					title: title,
					status: status,
					members: members_id,
					description: description,
					note: note,
					attachments: filePaths,
					createdAt: taskCreatedDate,
                    endDate: taskEndDate,
				});

				if (response.data.success === true) {
					toast.success(response.data.message);
				} else {
					toast.error(response.data.message);
				}
			} else {
				console.log(response);
				toast.error(response.message);
			}
		}
	}

	function HandleUploadFiles(event) {
		const maxSize = 20 * 1024 * 1024; // 20MB in bytes
		for (let i = 0; i < files.length; i++) {
			const fileSize = files[i].size;
			if (fileSize > maxSize) {
				alert(`File ${files[i].name} is too large. Maximum size is 20MB.`);
				files = null;
				event.target.value = null;
				return;
			}
		}
	}

	function deleteMemberInArray(employee_id) {
		const index = members.findIndex((member) => member.id === employee_id);
		if (index !== -1) {
			members.splice(index, 1);
		}
	}

	function SearchEmployee(event) {
		employeesSearch = employees.filter((employee) => {
			return employee.user_info[0].fullname
				.toLowerCase()
				.includes(event.target.value.toLowerCase());
		});
	}

	function HandleSelectEmployee(employeeObj) {
		if (members.filter((obj) => obj.id === employeeObj.id).length === 0) {
			members = [...members, employeeObj];
		}
	}
</script>

<!-- Bread crumb dùng để điều hướng về trang trước đó 
	depth là link điều hướng ngăn cách bởi || 
	show là tên hiện ra tương ứng với link điều hướng ngăn cách bởi ||
-->
<Breadcrumb depth="/projects||/projects/{project._id}||/epics/{epic._id}" 
			show="Project||{project.title}||{epic.title}"/>
<!-- Notification -->
<Toaster position="bottom-right" />
<!-- on:submit={CreateTask}  -->
<div class="w-full h-auto py-2 px-4 mx-auto max-w-4xl lg:py-8">
	<h2 class="text-xl text-center font-bold text-gray-900 dark:text-white">Create Task</h2>
	<form on:submit={CreateTask} enctype="multipart/form-data" class="rounded-sm p-8">
		<div class="w-full">
			<div class="sm:col-span-2">
				<label for="title" class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
					>Title</label
				>
				<input
					bind:value={title}
					type="text"
					name="title"
					class={`bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
					placeholder="Title"
					required
				/>
			</div>
			<div class="sm:col-span-2 mt-3">
				<label for="title" class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
					>Date</label
				>
				<div class="flex rounded rounded-tl-none w-auto pb-3 ">
					<div class="flex items-center mx-3 p-3 rounded bg-base-100 w-full markdown dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
						<div class="font-medium mr-2">Project Created Date:</div>
						<div class="w-auto">
							<DateInput 	format="yyyy/MM/dd HH:mm:ss" 
										max={maxDateSelectedInCalender}
										bind:value={taskCreatedDate} />
						</div>
					</div>
					<div class="flex items-center mx-3 p-3 rounded bg-base-100 w-full markdown 
								dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
						<div class="font-medium text-md mr-2">Project End Date:</div>
						<div>
							<DateInput 	
										
										format="yyyy/MM/dd HH:mm:ss" 
										max={maxDateSelectedInCalender}
										bind:value={taskEndDate} />
						</div>
					</div>	
				</div>
			</div>		
			<div class="sm:col-span-2 mt-3">
				<!-- <div class="flex flex-col items-center space-y-5 sm:flex-row sm:space-y-0">                                   -->
				<!-- <div class="flex flex-col space-y-5 sm:ml-8"> -->
				<!-- py-3.5 px-7  -->
				<label for="title" class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
					>Attachments</label
				>
				<input
					type="file"
					id="file"
					name="file"
					class="py-3.5 px-7 w-full text-base font-medium text-indigo-100 focus:outline-none bg-[#202142] rounded-lg border border-indigo-200 hover:bg-indigo-900 focus:z-10 focus:ring-4 focus:ring-indigo-200"
					bind:files
					on:change={HandleUploadFiles}
					multiple
				/>
				<!-- </div>	 -->
				<!-- </div> -->
			</div>
			<div class="sm:col-span-2 mt-3">
				<label for="title" class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
					>Status</label
				>
				<select
					bind:value={status}
					class="px-3 py-1.5 w-full inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
				>
					<option value="To Do" selected>To Do</option>
					<option value="In Progress">In Progress</option>
					<option value="Completed">Completed</option>
				</select>
			</div>
			<input
				bind:value={status}
				type="hidden"
				name="status"
				class={`bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500      `}
				placeholder="Status"
			/>
			<div class="sm:col-span-2 mt-3">
				<label for="leader" class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
					>Member</label
				>
				<input
					on:input={SearchEmployee}
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
								<th scope="col" class="px-6 py-3 w-[350px]"> Name </th>
								<th scope="col" class="px-6 py-3 text-center"> Office </th>
								<th scope="col" class="px-6 py-3 text-center"> Department </th>
								<th scope="col" class="px-6 py-4 text-center"> Select </th>
							</tr>
						</thead>
						<tbody>
							{#if employeesSearch != null}
								{#each employeesSearch as employee}
									<tr
										class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
									>
										<th
											scope="row"
											class="flex items-center px-6 py-4 w-[350px] text-gray-900 whitespace-nowrap dark:text-white"
										>
											<img
												class="w-10 h-10 rounded-full"
												src="/images/profile/{employee.user_info[0].profile_image}"
												alt="Manager avatar"
											/>

											<div class="ps-3">
												<div class="text-base font-semibold">{employee.user_info[0].fullname}</div>
												<div class="font-normal text-gray-500">{employee.user_info[0].email}</div>
											</div>
										</th>
										<td class="px-6 py-4 text-center">
											{officeMapping[employee.user_info[0].office]}
										</td>
										<td class="px-6 py-4 text-center">
											{departmentMapping[employee.user_info[0].department]}
										</td>
										<td class="px-6 py-4 text-center">
											<button
												class="px-5 py-2.5 text-base font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
												on:click|preventDefault={HandleSelectEmployee({
													id: employee._id,
													fullname: employee.user_info[0].fullname
												})}
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
									<td class="px-6 py-4 text-center" colspan="4">No employees found</td>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>
			</div>
			<input
				bind:value={members}
				type="hidden"
				name="members_id"
				class={`bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500      `}
				placeholder="Members ID"
			/>

			<div class="w-screen mt-3">
				<!-- {#if memberObject}
                    a
                {/if} -->
				<label for="title" class="block mb-2 text-base font-bold text-gray-900 dark:text-white">
					Selected Members
				</label>
				<div class="flex flex-nowrap">
					{#each members as member}
						<div
							class="mr-2 font-bold text-gray-900 dark:text-white bg-gray-700"
							style="width:fit-content"
						>
							{member.fullname}
							<button
								on:click|preventDefault={() => {
									//delete member id in array
									deleteMemberInArray(member.id);
									//show member just delete again
									members = members.filter((member1) => member1.id !== member.id);
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
			<div class="sm:col-span-2 mt-3">
				<label
					for="description"
					class="block mb-2 text-base font-bold text-gray-900 dark:text-white">Description</label
				>
				<textarea
					bind:value={description}
					name="description"
					rows="3"
					class="block p-2.5 w-full text-base text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
					placeholder="Description"
				></textarea>
			</div>
			<div class="sm:col-span-2 mt-3">
				<label
					for="description"
					class="block mb-2 text-base font-bold text-gray-900 dark:text-white">Note</label
				>
				<textarea
					bind:value={note}
					name="note"
					rows="2"
					class="block p-2.5 w-full text-base text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
					placeholder="Note"
				></textarea>
			</div>
			<div class="flex justify-center">
				<button
					type="submit"
					class="px-5 py-2.5 mt-4 mr-2 sm:mt-6 text-base font-medium text-center text-white bg-green-700 rounded-lg focus:ring-4 focus:ring-green-200 dark:focus:ring-green-900 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Create
				</button>
				<!-- <a href="../project" class="hover:no-underline">
                    <button
                        class="px-5 py-2.5 mt-4 ml-2 sm:mt-6 text-base font-medium text-center text-white bg-red-700 rounded-lg focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900 hover:bg-red-800"
                        on:click={(event)=>{
                            event.preventDefault();                         
                        }}
                        >
                        Cancel
                    </button>
                </a> -->
			</div>
		</div>
	</form>
</div>
