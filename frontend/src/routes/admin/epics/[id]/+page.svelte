<script>
	import toast, { Toaster } from "svelte-french-toast";
	import Breadcrumb from "$lib/components/Breadcrumb/AdminBreadcrumb.svelte";
	// import { page } from '$app/stores';
	import { dndzone } from 'svelte-dnd-action';
	import { goto } from "$app/navigation";
	import { Carta, MarkdownEditor, Markdown } from 'carta-md';
	import 'carta-md/default.css'; /* Default theme */
	import '@cartamd/plugin-code/default.css';
	import DOMPurify from 'isomorphic-dompurify';
	import { code } from '@cartamd/plugin-code';
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
	let epicID = data.props.epicID;
	var epic = data.props.epic;

	var project = data.props.project;
	var projectID = project._id;

	var GetTask = data.props.tasks;
	var employees = data.props.employees;
	

	//Display fields
	var title = epic.title;
	let epicDescription = '';
	let titleEditable;
	var value = epic.description; //Description field

	let editMode = false;

	// add id into array , this id coincides with _id
	const tasks = GetTask?.map(item => {
        return { ...item, id: item._id };
    });
	//count total tasks
	let totalTasksCount = tasks.length;

	let completedTasks = tasks.filter((task) => task.status === "Completed");
	let inProgressTasks = tasks.filter((task) => task.status === 'In Progress');
	let toDoTasks = tasks.filter((task) => task.status === 'To Do');
	let evaluationTasks = tasks.filter((task) => task.status === 'Evaluation');


	
	let GetTaskToUpdate;
	// Xử lý sự kiện khi một mục được click để bắt đầu kéo và thả
	function transformDraggedElement(draggedEl, data, index) {
		// const msg = `My index is ${index}`;
		// draggedEl.innerHTML = msg;
		GetTaskToUpdate = data;
		// console.log("data:",GetTaskToUpdate)
	}

	function handleCompletedDndConsider(e) {
		completedTasks = e.detail.items;
		// console.log("All completedTasks",completedTasks);
		
	}
	function handleEvaluationDndConsider(e) {
		evaluationTasks = e.detail.items;
	}
	function handleInProgressDndConsider(e) {
		inProgressTasks = e.detail.items;
		// console.log("All inProgressTasks",inProgressTasks);
	}
	
	function handleToDoDndConsider(e) {
		toDoTasks = e.detail.items;
		// console.log("All toDoTasks",toDoTasks);
	}
	//update task status to 'completed'
	async function handleCompletedDndFinalize(e) {
		completedTasks = e.detail.items;
		for (var i = 0; i < completedTasks.length;i++){
			if (completedTasks[i]?._id == GetTaskToUpdate._id){
				await axios.put(`/task-update-status/${GetTaskToUpdate._id}`,{
					status: "Completed",
					completionDate: new Date(),
				})
				.then((res) => {
					console.log("update status completed success:",res);
				})
				.catch((err) => {
					console.log("update status error:",err);
				})
			}
		}
	}
	//update task status to 'completed'
	async function handleToDoDndFinalize(e) {
		toDoTasks = e.detail.items;
		for (var i = 0; i < toDoTasks.length;i++){
			if (toDoTasks[i]?._id ==GetTaskToUpdate._id){
				await axios.put(`/task-update-status/${GetTaskToUpdate._id}`,{
					status: "To Do",
					// set completion time to null, i.e. to date "0001-01-01 00:00:00 +0000 UTC"
					completionDate: null,
				})
				.then((res) => {
					console.log("update status to do success:",res);
				})
				.catch((err) => {
					console.log("update status error:",err);
				})
			}
		}
	}
	async function handleEvaluationDndFinalize(e) {
		evaluationTasks = e.detail.items;
		for (var i = 0; i < evaluationTasks.length;i++){
			if (evaluationTasks[i]?._id == GetTaskToUpdate._id){
				await axios.put(`/task-update-status/${GetTaskToUpdate._id}`,{
					status: "Evaluation",
					// set completion time to null, i.e. to date "0001-01-01 00:00:00 +0000 UTC"
					completionDate: null,
				})
				.then((res) => {
					console.log("update status evaluation success:",res);
				})
				.catch((err) => {
					console.log("update status error:",err);
				})
			}
		}
	}
	//update task statuc to 'in progress'
	async function handleInProgressDndFinalize(e) {
		inProgressTasks = e.detail.items;
		for (var i = 0; i < inProgressTasks.length;i++){
			if (inProgressTasks[i]?._id == GetTaskToUpdate._id){
				await axios.put(`/task-update-status/${GetTaskToUpdate._id}`,{
					status: "In Progress",
					// set completion time to null, i.e. to date "0001-01-01 00:00:00 +0000 UTC"
					completionDate: null,
				})
				.then((res) => {
					console.log("update status in progress success:",res);
				})
				.catch((err) => {
					console.log("update status error:",err);
				})
			}
		}

	}

	function handleClick() {
		alert('clicked');
	}

	function generateColor(seed) {

		//if seed is null . it can cause problems when use "spilit"
		if (seed != null){
			// Convert the seed to a number to ensure consistent results
			const seedNumber = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

			// Use the seed to generate a consistent random number
			const random = (seed) => {
				let x = Math.sin(seed++) * 10000;
				return x - Math.floor(x);
			};

			// Generate a pastel color using HSL
			// Hue is randomized, Saturation is kept low to ensure pastel, Lightness is kept high
			return (
				'hsl(' +
				360 * random(seedNumber) +
				',' +
				(30 + 70 * random(seedNumber)) +
				'%,' +
				(90 + 10 * random(seedNumber)) +
				'%)'
			);
		}
	}

	const carta = new Carta({
		sanitizer: DOMPurify.sanitize,
		extensions: [code()]
	});

	



	function toggleEdit() {
		// if (editMode === true) {
		// 	// if (validateUpdate()) return;
		// 	// //hide input
		// 	// titleEditable.style.display = 'none';
		// 	// //show title
		// 	// title.style.display = 'block';
		// 	// if (!checkFalseUpdate()) {
		// 	// 	epicId = titleEditable.value;
		// 	// 	epicDescription = value;

		// 	// 	//update the epic
		// 	// 	console.log({
		// 	// 		title: epicId,
		// 	// 		description: epicDescription
		// 	// 	});
		// 	// }
		// 	editMode = !editMode;
		// 	return;
		// }
		// //hide title
		// title.style.display = 'none';
		// //show input
		// titleEditable.style.display = 'block';

		editMode = !editMode;
	}
	function UpdateEpic(){
		validateUpdate()

		if(validateUpdate() != true) {
			axios.put(`/epic/${epicID}`,{
				title: title,
				description: value
			})
			.then((res) => {
				toast.success(res.data.msg);
			})
			.catch((err) => {
				toast.error(err.data.msg);
			})
		}		
	}

	let updateErrorMessage = '';
	function checkFalseUpdate() {
		if (value === epicDescription && title === title) {
			updateErrorMessage = 'No changes made'
			return true;
		}
		return false;
	}

	//return error type boolean
	function validateUpdate() {
		//update the epic
		var isErr = false;
		//flush out any error message
		updateErrorMessage = '';
		//return if nothing is changed
		if (title === '') {
			updateErrorMessage = 'Epic name missing';
			isErr = true;
		}

		return isErr;
	}

	let confirmInput;
	let deleteCheckbox;
	let deleteErrorMessage = ' ';
	async function validateDelete() {
		if (confirmInput === title && deleteCheckbox.checked) {
			try {
				// Make the DELETE request using Axios
				const response = await axios.delete(`/epic/${epicID}`);
			} catch (error) {
				// Handle errors
				console.error(error);
				deleteErrorMessage = 'Can not delete this epic';
				return; 
			}
		} else if (confirmInput !== title) {
			// confirmInput.classList.add('input-error');
			deleteErrorMessage = 'Please input the correct';
			return;
		} else if (!deleteCheckbox.checked) {
			deleteErrorMessage = 'Please check the checkbox';
			return;
		}
		//close modal
		deleteConfirmationModal.close();
		//redirect to projects
		window.location.href = `/admin/project/${epic.project}`;
	}

	function ConvertDate(GetDate) {
		let ResponeDate;
		ResponeDate = new Date(GetDate).toLocaleDateString();
		return ResponeDate;
	}

	//Use regex to search for the query in selected field
	let search = '';
	let field = 'title';
	$: regex = search ? new RegExp(search, 'i') : null; //case insensitive
	$: matches = (item) => (regex ? regex.test(item[field]) : true); //ternary, check if regex is true, if true, test the regex, if false, return true
</script>
<!-- Bread crumb dùng để điều hướng về trang trước đó 
	depth là link điều hướng ngăn cách bởi || 
	show là tên hiện ra tương ứng với link điều hướng ngăn cách bởi ||
-->
<Breadcrumb depth="/projects||/projects/{projectID}" show="project||{project.title}"/>
<Toaster position="bottom-right" />

<div class="-ml-16 sm:ml-5 mt-0 z-0 h-fit bg-base-100 rounded-md p-5 rounded-tl-none">
	<div class="flex w-auto flexcol justify-between">
		{#if editMode === false}
			<h1 class="prose -mb-3 font-bold text-2xl sm:text-3xl text-left pl-3">
				{title}
			</h1>
		{:else}
			<input
				type="text"
				class="p-0 pl-3 input w-48 sm:w-auto input-bordered h-10 -mb-3 prose font-bold text-2xl sm:text-3xl text-left"
				bind:value={title}
				size="20"
			/>
		{/if}
		<div class="flex justify-center gap-1">
			{#if editMode === false}
				<button class="btn btn-sm h-10" on:click={toggleEdit}>
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
					</svg></button
				>
				<button class="btn btn-sm btn-error h-10" onclick="deleteConfirmationModal.showModal()"
					><svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						fill="currentColor"
						class="bi bi-trash text-neutral-50"
						viewBox="0 0 16 16"
					>
						<path
							d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"
						/>
						<path
							d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"
						/>
					</svg></button
				>
			{:else}
				<button class="btn btn-primary btn-sm h-10" on:click={toggleEdit}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						fill="currentColor"
						class="bi bi-check-lg"
						viewBox="0 0 16 16"
					>
						<path
							d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"
						/>
					</svg></button
				>
			{/if}
			<dialog id="deleteConfirmationModal" class="modal">
				<div class="modal-box">
					<h3 class="font-bold text-lg mb-5">You are trying to delete this Epic</h3>
					<p>
						This will delete all children tasks, the action is not reversible, so please make sure
						that you want to delete this epic.
					</p>
					<div class="confirmation_form flex flex-col gap-2 mt-5">
						<label for="confirm_input"
							>Type "<strong class="text-error">{title}</strong>" to confirm</label
						>
						<!-- on:focus={() => {
							confirmInput.classList.remove('input-error');
							errorMessage = ' ';
						}} -->
						<input
							type="text"
							id="confirm_input"
							class="input input-bordered input-sm h-10"
							bind:value={confirmInput}							
						/>
						<label class="cursor-pointer label">
							<span class="label-text">I acknowledge that this action is irreversible</span>
							<input
								type="checkbox"
								class="checkbox [--chkfg:white]"
								bind:this={deleteCheckbox}
								on:forminput={() => (deleteErrorMessage = ' ')}
							/>
						</label>
					</div>
					<!-- <div class="confirmation_form flex flex-col gap-2 mt-5">
						<label class="cursor-pointer label">
							<span class="label-text">I acknowledge that this action is irreversible</span>
							<input
								type="checkbox"
								class="checkbox [--chkfg:white]"
								bind:this={deleteCheckbox}
								on:forminput={() => (deleteErrorMessage = ' ')}
							/>
						</label>
					</div> -->
					<div class="modal-action">
						<p class="prose font-normal text-sm text-error text-center">{deleteErrorMessage}</p>
						<button class="btn btn-sm h-10 btn-error text-neutral-50" on:click={validateDelete}
							>Delete</button
						>
						<form method="dialog">
							<!-- if there is a button in form, it will close the modal -->
							<button class="btn btn-sm h-10">Close</button>
						</form>
					</div>
				</div>
			</dialog>
		</div>
	</div>
	<p class="text-error text-md ml-auto text-end">{updateErrorMessage}</p>
	<div class="overflow-x-auto mt-3 p-3 bg-neutral-200 rounded-md">
		<div class=" p-3 rounded bg-base-100 w-auto markdown">
			<p class="font-medium text-md mb-2">Epic description:</p>
			<div class="w-full">
				{#if editMode === false}
					{#if value !== ''}
						<Markdown {carta} {value} />
					{:else}
						<p>No description</p>
					{/if}
				{:else}
					<MarkdownEditor {carta} bind:value mode="tabs" />
				{/if}
			</div>
		</div>
		{#if editMode === true}
			<button class="btn btn-primary btn-sm h-10 w-full" on:click={UpdateEpic}>Update</button>
		{/if}

		<div class="divider divider-neutral m-0 mb-2 mt-4" />
		<h1 class="prose font-bold text-lg sm:text-xl text-left">Available tasks</h1>
		<div class="flex flex-row gap-2 opacity-55">
			<p>Total Tasks: {totalTasksCount}</p>
			<p>Completed: {completedTasks.length} / {totalTasksCount}</p>
		</div>
		<div class="flex sm:flex-row flex-col-reverse sm:gap-2 mb-3">
			<button class="btn btn-sm h-10 btn-primary" 
				on:click={() => goto(`/admin/task-create/${epicID}`)}
				>Create task
			</button>
			<div class="flex flex-row sm:flex-row-reverse gap-1 w-full sm:w-2/6">
				<label class="input h-10 input-sm input-bordered flex items-center join-item w-full">
					<input bind:value={search} type="text" class="w-full" placeholder="Search for task" />
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
				
		<!-- for loop -->
		<!-- row-content -->
		<!-- <div class="flex flex-row"> -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<div class="flex flex-col w-full bg-neutral-100 rounded">
				<div class="w-full p-5 h-auto">
					<h2 class="prose text-xl font-bold p-3">To-Do Tasks</h2>
					<div
						class="flex flex-col gap-2 min-h-40 h-auto"
					
						use:dndzone={{ items: toDoTasks , transformDraggedElement}}
						on:consider={handleToDoDndConsider}
						on:finalize={handleToDoDndFinalize}
					>
					{#if toDoTasks != null}
						{#each toDoTasks.filter(matches) as item (item.id)}
							<button								
								style:background-color={generateColor(item.title)}
								class="flex flex-row gap-2 p-3 bg-neutral-100 w-full text-start rounded border-[3px] hover:shadow-lg hover:-translate-y-1 hover:border-primary transition-translation duration-200 ease-out"
							>
								<div class=" flex flex-col w-full">
									<div class="grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-2 flex flex-row items-center justify-between gap-2">
										<div class="overflow-auto break-words">
											<p class="font-bold text-lg">{item.title}</p>
										</div>										
										<div class="text-center sm:text-left">
											<p class="text-sm badge badge-outline">To Do</p>
										</div>						
									</div>
									<!-- <p class="text-md">{item.description}</p> -->
									<div class="text-md">
										<div class="avatar-group -space-x-6 rtl:space-x-reverse">
											{#if item.members != null}
												{#each item.members as member, index}													
													{#each employees as employee}					
														{#if member == employee._id}																													
															{#if index < 3}
																<div class="avatar">
																	<div class="w-12">
																		<img
																			alt="avatar"
																			src="/images/profile/{employee.profile_image}"
																		/>
																	</div>
																</div>
															{:else if index === 3}
																<div class="avatar placeholder">
																	<div class="w-12 bg-neutral text-neutral-content">
																		<span>+{item.members.length - index}</span>
																	</div>
																</div>
															{/if}
														{/if}
													{/each}													
												{/each}
											{/if}
										</div>
									</div>
									<!-- {item.Attachments.length} -->
									<!-- <p class="text-md">Attachments: </p> -->
									<div class="grid grid-cols-2">
										<div>
											<p class="text-xs">Start date</p>
											<p class="text-xs">{ConvertDate(item.createdAt)}</p>
										</div>
										<div>
											<p class="text-xs">End date</p>
											<p class="text-xs">{ConvertDate(item.updatedAt)}</p>
										</div>						
									</div>
								</div>
							</button>
						{/each}
					{/if}
					</div>
				</div>
			</div>
			<!-- <div class="divider divider-horizontal" /> -->
			<div class="flex flex-col w-full bg-neutral-100 rounded">
				<div class="w-full p-5 h-auto">
					<h2 class="prose text-xl font-bold p-3">In-Progress tasks</h2>
					<div
						class="flex flex-col gap-2 h-auto min-h-40"
						use:dndzone={{ items: inProgressTasks, transformDraggedElement }}
						on:consider={handleInProgressDndConsider}
						on:finalize={handleInProgressDndFinalize}
					>
					{#if inProgressTasks != null}
						{#each inProgressTasks.filter(matches) as item (item.id)}
							<button
								on:click={handleClick}
								style:background-color={generateColor(item.title)}
								class="flex flex-row gap-2 p-3 bg-neutral-100 w-full text-start rounded border-[3px] hover:shadow-lg hover:-translate-y-1 hover:border-primary transition-translation duration-200 ease-out"
							>
								<div class="flex flex-col w-full">
									<div class="grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-2 flex flex-row items-center justify-between gap-2">
										<div class="overflow-auto break-words">
											<p class="font-bold text-lg">{item.title}</p>
										</div>										
										<div class="text-center sm:text-left">
											<p class="text-sm badge badge-info" style="font-size: 12px;">In Progress</p>
										</div>						
									</div>
									<!-- <p class="text-md">{item.description}</p> -->
									<div class="text-md">
										<div class="avatar-group -space-x-6 rtl:space-x-reverse">
											{#if item.members != null}
												{#each item.members as member, index}
													{#each employees as employee}
														{#if member == employee._id}
															{#if index < 3}
																<div class="avatar">
																	<div class="w-12">
																		<img
																			alt="avatar"
																			src="/images/profile/{employee.profile_image}"
																		/>
																	</div>
																</div>
															{:else if index === 3}
																<div class="avatar placeholder">
																	<div class="w-12 bg-neutral text-neutral-content">
																		<span>+{item.members.length - index}</span>
																	</div>
																</div>
															{/if}
														{/if}
													{/each}													
												{/each}
											{/if}
										</div>
									</div>
									<!-- <p class="text-md">Attachments: </p> -->
									<div class="grid grid-cols-2">
										<div>
											<p class="text-xs">Start date</p>
											<p class="text-xs">{ConvertDate(item.createdAt)}</p>
										</div>
										<div>
											<p class="text-xs">End date</p>
											<p class="text-xs">{ConvertDate(item.updatedAt)}</p>
										</div>						
									</div>
								</div>
							</button>
						{/each}
					{/if}
					</div>
				</div>
			</div>

			<!-- <div class="divider divider-horizontal" /> -->
			<div class="flex flex-col w-full bg-neutral-100 rounded">
				<div class="w-full p-5 h-auto">
					<h2 class="prose text-xl font-bold p-3">Evaluation tasks</h2>
					<div
						class="flex flex-col gap-2 h-auto min-h-40"
						use:dndzone={{ items: evaluationTasks, transformDraggedElement }}
						on:consider={handleEvaluationDndConsider}
						on:finalize={handleEvaluationDndFinalize}
					>
					{#if evaluationTasks != null}
						{#each evaluationTasks.filter(matches) as item (item.id)}
							<button
								on:click={handleClick}
								style:background-color={generateColor(item.title)}
								class="flex flex-row gap-2 p-3 bg-neutral-100 w-full text-start rounded border-[3px] hover:shadow-lg hover:-translate-y-1 hover:border-primary transition-translation duration-200 ease-out"
							>
								<div class="flex flex-col w-full">
									<div class="grid grid-cols-2 flex flex-row items-center justify-between gap-2">
										<div class="overflow-auto break-words">
											<p class="font-bold text-lg">{item.title}</p>
										</div>										
										<div class="text-center">
											<p class="badge badge-info" style="font-size: 13px;">Evaluation</p>
										</div>						
									</div>
									<!-- <p class="text-md">{item.description}</p> -->
									<div class="text-md">
										<div class="avatar-group -space-x-6 rtl:space-x-reverse">
											{#if item.members != null}
												{#each item.members as member, index}
													{#each employees as employee}
														{#if member == employee._id}
															{#if index < 3}
																<div class="avatar">
																	<div class="w-12">
																		<img
																			alt="avatar"
																			src="/images/profile/{employee.profile_image}"
																		/>
																	</div>
																</div>
															{:else if index === 3}
																<div class="avatar placeholder">
																	<div class="w-12 bg-neutral text-neutral-content">
																		<span>+{item.members.length - index}</span>
																	</div>
																</div>
															{/if}
														{/if}
													{/each}													
												{/each}
											{/if}
										</div>
									</div>
									<!-- <p class="text-md">Attachments: </p> -->
									<div class="grid grid-cols-2">
										<div>
											<p class="text-xs">Start date</p>
											<p class="text-xs">{ConvertDate(item.createdAt)}</p>
										</div>
										<div>
											<p class="text-xs">End date</p>
											<p class="text-xs">{ConvertDate(item.updatedAt)}</p>
										</div>						
									</div>
								</div>
							</button>
						{/each}
					{/if}
					</div>
				</div>
			</div>

			<!-- <div class="divider divider-horizontal" /> -->
			<div class="flex flex-col w-full bg-neutral-100 rounded">
				<div class="w-full p-5 h-auto">
					<h2 class="prose text-xl font-bold p-3">Completed tasks</h2>
					<div
						class="flex flex-col min-h-40 gap-2 h-auto"
						use:dndzone={{ items: completedTasks , transformDraggedElement}}
						on:consider={handleCompletedDndConsider}
						on:finalize={handleCompletedDndFinalize}
					>
					{#if completedTasks != null}
						{#each completedTasks.filter(matches) as item (item.id)}
							<button
								style:background-color={generateColor(item.title)}
								class="flex flex-row gap-2 p-3 bg-neutral-100 w-full text-start rounded border-[3px] hover:shadow-lg hover:-translate-y-1 hover:border-primary transition-translation duration-200 ease-out"
							>
								<div class="flex flex-col w-full">
									<div class="flex flex-row items-center justify-between gap-2">
										<p class="font-bold text-lg">{item.title}</p>
										<p class="text-md badge text-neutral-50 badge-accent">Completed</p>
									</div>
									<!-- <p class="text-md">{item.description}</p> -->
									<div class="text-md">
										<div class="avatar-group -space-x-6 rtl:space-x-reverse">
											{#if item.members != null}
												{#each item.members as member, index}
													{#each employees as employee}
														{#if member == employee._id}
															{#if index < 3}
																<div class="avatar">
																	<div class="w-12">
																		<img
																			alt="avatar"
																			src="/images/profile/{employee.profile_image}"
																		/>
																	</div>
																</div>
															{:else if index === 3}
																<div class="avatar placeholder">
																	<div class="w-12 bg-neutral text-neutral-content">
																		<span>+{item.members.length - index}</span>
																	</div>
																</div>
															{/if}
														{/if}
													{/each}													
												{/each}
											{/if}
										</div>
									</div>
									<!-- <p class="text-md">Attachments:</p> -->
									<div class="grid grid-cols-2">
										<div>
											<p class="text-xs">Start date</p>
											<p class="text-xs">{ConvertDate(item.createdAt)}</p>
										</div>
										<div>
											<p class="text-xs">End date</p>
											<p class="text-xs">{ConvertDate(item.updatedAt)}</p>
										</div>						
									</div>
								</div>
							</button>
						{/each}
					{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
