<script>
	import Breadcrumb from '$lib/components/Breadcrumb/AdminBreadcrumb.svelte';
	import { page } from '$app/stores';

	import { Carta, MarkdownEditor, Markdown } from 'carta-md';
	import 'carta-md/default.css'; /* Default theme */
	import '@cartamd/plugin-code/default.css';
	import DOMPurify from 'isomorphic-dompurify';
	import { code } from '@cartamd/plugin-code';
	import axios from 'axios';
	import toast, { Toaster } from "svelte-french-toast";
	import { goto } from "$app/navigation";
	import { DateInput } from 'date-picker-svelte'

	let maxDateSelectedInCalender = new Date("3000-1-1 00:00:00");

	const carta = new Carta({
		sanitizer: DOMPurify.sanitize,
		extensions: [code()]
	});

	//Get Id from +page.server.js
    export let data;
    var project = data.props.project;
	var epics = data.props.epics;
	var employees = data.props.employees;
	var projectCreateDateInput = new Date(project.createdAt);
	var projectEndDateInput = new Date(project.endDate);

	//Display fields
	var title = project.title;
	var projectId = project._id;
	let value = project.description; //Description field
	let ProjectCreationDate = ConvertDate(project.createdAt);
	let ProjectUpDate = ConvertDate(project.updatedAt);

	let leader_name = project.leader_userinfor[0].fullname;
	let leader_id = project.leader[0]._id
	let leader_profile_image = project.leader_userinfor[0].profile_image;


	// //Other fields
	$: editMode = false;
	function toggleEdit() {
		editMode = !editMode;
	}

	//delete project confirmation
	let confirmInput;
	let deleteCheckbox;
	let errorMessage = '';
	async function validateDelete() {
		if (confirmInput === title && deleteCheckbox.checked) {
			try {
				// Make the DELETE request using Axios
				const response = await axios.delete(`/project/${projectId}`);
			} catch (error) {
				// Handle errors
				console.error(error);
				return; 
			}
		} else if (confirmInput !== title) {
			// confirmInput.classList.add('input-error');
			errorMessage = 'Please input the correct';
			return;
		} else if (!deleteCheckbox.checked) {
			errorMessage = 'Please check the checkbox';
			return;
		}
		//close modal
		deleteConfirmationModal.close();
		//redirect to projects
		window.location.href = '/admin/projects';
	}

	function UpdateProject(){
		axios.put(`/project/${projectId}`,{
			leader: leader_id,
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

	function ConvertDate(GetDate){
		let DateResponse;
		DateResponse = new Date(GetDate).toLocaleDateString()
		return DateResponse 
	}

	function ProgressCaculation(epic, numberOfAllTasksInEpic) {
		let completedTasks = 0;
		let progress = 0;
		// Lặp qua các task trong project
		epic.tasks.forEach((task) => {
			// Nếu trạng thái của task là "completed", tăng biến completedTasks lên 1
			if (task.status === "Completed") {
				completedTasks++;
			}
		});
		progress = Math.round((completedTasks / numberOfAllTasksInEpic) * 100);

		//Check if progress is NaN value
		if (isNaN(progress)) {
			progress = 0;
		}
		// Trả về số lượng task đã hoàn thành trong project
		return progress;
	}
</script>

<!-- Bread crumb dùng để điều hướng về trang trước đó 
	depth là link điều hướng ngăn cách bởi || 
	show là tên hiện ra tương ứng với link điều hướng ngăn cách bởi ||
-->
<Breadcrumb depth="/projects" show="Projects"/>
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
				<button class="btn btn-sm h-10" on:click={() => goto(`/admin/projects/project-analysis/${projectId}`)}>
					<img width="30" height="30" src="https://img.icons8.com/ios/50/combo-chart--v1.png" alt="combo-chart--v1"/>
				</button>
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
					<h3 class="font-bold text-lg mb-5">You are trying to delete this project</h3>
					<p>
						This will delete all children epic and tasks, the action is not reversible, so please
						make sure that you want to delete this project
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
								on:forminput={() => (errorMessage = ' ')}
							/>
						</label>
					</div>
					<div class="modal-action">
						<p class="text-error text-center">{errorMessage}</p>
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
	<p class="text-md opacity-50 pl-3 mb-4">{ProjectCreationDate}</p>
	<div class="flex flex-wrap bg-neutral-200 p-2 pl-3 pt-2 w-full rounded-t">
		<div class="white-container flex flex-row items-center bg-neutral-100 px-2 rounded">
			<div class="avatar">
				<div class="sm:w-12 h-12 rounded-full outline-slate-300 ring-2 ring-slate-100">
					<img
						src="/images/profile/{leader_profile_image}"
						alt="Project Leader"
					/>
				</div>
			</div>
			<div class="flex flex-col ml-2 mr-2">
				<strong>Project leader</strong>
				<p>{leader_name}</p>
			</div>
		</div>
		<div class="mt-2 sm:mt-0 ml-0 sm:m-1 sm:ml-auto px-2 py-1 rounded bg-base-100">
			<p>
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
				{ProjectCreationDate}
			</p>
			<p>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					fill="currentColor"
					class="bi bi-arrow-repeat inline"
					viewBox="0 0 16 16"
				>
					<path
						d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9"
					/>
					<path
						fill-rule="evenodd"
						d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"
					/>
				</svg>
				:
				{ProjectUpDate}
			</p>
		</div>
	</div>
	<div class="flex flex-col bg-neutral-200 rounded rounded-tl-none w-auto">
		<div class="mx-3 p-3 rounded bg-base-100 w-auto markdown">
			<p class="font-medium text-md mb-2 w">Project description:</p>
			<div class="w-full">
				{#if editMode === false}
					{#if value !== ''}
						<Markdown {carta} {value} />
					{:else}
						<p>No description</p>
					{/if}
				{:else}
					<MarkdownEditor {carta} bind:value  mode="tabs" />
				{/if}
			</div>
		</div>
		{#if editMode === true}
			<div class="flex bg-neutral-200 mt-3 rounded rounded-tl-none w-auto pb-3">
				<div class="flex items-center mx-3 p-3 rounded bg-base-100 w-full markdown">
					<div class="font-medium text-md mr-2">Project Created Date:</div>
					<div class="w-auto">
						<DateInput 	format="yyyy/MM/dd HH:mm:ss" 
									max={maxDateSelectedInCalender}
									bind:value={projectCreateDateInput} />
					</div>
				</div>
				<div class="flex items-center mx-3 p-3 rounded bg-base-100 w-full markdown">
					<div class="font-medium text-md mr-2">Project End Date:</div>
					<div>
						<DateInput 	format="yyyy/MM/dd HH:mm:ss" 
									max={maxDateSelectedInCalender}
									bind:value={projectEndDateInput} />
					</div>
				</div>	
			</div>
		{/if}
		
		{#if editMode === true}
			<button class="btn btn-primary btn-sm h-10" on:click={UpdateProject}>Update</button>
		{/if}
		<h1 class="prose ml-6 mt-4 font-bold text-lg sm:text-xl text-left">List of epics</h1>
		<div class="flex mx-6 flex-row gap-2 opacity-55">
			<!-- <p>Total Epic: {sortedList.length}</p>
			<p>Completed: {completedEpicsCount} / {totalEpicsCount}</p> -->
		</div>
		<div class="overflow-x-auto p-3 bg-neutral-200 rounded-md">
			<div class="flex sm:flex-row flex-col-reverse sm:gap-2 mb-3">
				<div class="flex flex-row sm:flex-row-reverse gap-1 w-full sm:w-2/6">
					<details class="dropdown">
						<summary class="btn btn-sm h-10 bg-base-100"
							><svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								fill="currentColor"
								class="bi bi-funnel"
								viewBox="0 0 16 16"
							>
								<path
									d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z"
								/>
							</svg></summary
						>
						<ul class="mt-1 shadow menu dropdown-content z-[1] bg-base-100 rounded-md w-52">
							<div class="flex justify-between">
								<h1 class="prose font-bold ml-2">Sort by:</h1>
								<!-- sort direction -->
								<!-- <button
									on:click={() => {
										sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
									}}
									class="btn btn-sm bg-neutral-200 hover:bg-neutral-300"
								>
									{#if sortDirection === 'asc'}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="20"
											height="20"
											fill="currentColor"
											class="bi bi-sort-down-alt"
											viewBox="0 0 16 16"
										>
											<path
												d="M3.5 3.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 12.293zm4 .5a.5.5 0 0 1 0-1h1a.5.5 0 0 1 0 1zm0 3a.5.5 0 0 1 0-1h3a.5.5 0 0 1 0 1zm0 3a.5.5 0 0 1 0-1h5a.5.5 0 0 1 0 1zM7 12.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7a.5.5 0 0 0-.5.5"
											/>
										</svg>
									{:else}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="20"
											height="20"
											fill="currentColor"
											class="bi bi-sort-up"
											viewBox="0 0 16 16"
										>
											<path
												d="M3.5 12.5a.5.5 0 0 1-1 0V3.707L1.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.5.5 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L3.5 3.707zm3.5-9a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1z"
											/>
										</svg>
									{/if}
								</button> -->
							</div>
							<!-- radio button -->
							<li>
								<label class="cursor-pointer flex items-center gap-1">
									<!-- <input
										type="radio"
										name="sort"
										value="EpicTitle"
										bind:group={sortKey}
										class="form-radio"
									/> -->
									Epic title
								</label>
							</li>
							<li>
								<label class="cursor-pointer flex items-center gap-1">
									<!-- <input
										type="radio"
										name="sort"
										value="TaskCount"
										bind:group={sortKey}
										class="form-radio"
									/> -->
									Task count
								</label>
							</li>
							<li>
								<label class="cursor-pointer flex items-center gap-1">
									<!-- <input
										type="radio"
										name="sort"
										value="Progress"
										bind:group={sortKey}
										class="form-radio"
									/> -->
									Progress
								</label>
							</li>
							<li>
								<label class="cursor-pointer flex items-center gap-1">
									<!-- <input
										type="radio"
										name="sort"
										value="UpdatedAt"
										bind:group={sortKey}
										class="form-radio"
									/> -->
									Last updated
								</label>
							</li>
						</ul>
					</details>
					<label class="input h-10 input-sm input-bordered flex items-center join-item w-full">
						<!-- bind:value={search}  -->
						<input type="text" class="w-full" placeholder="Search for epic" />
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
					<button class="btn btn-sm h-10 btn-primary" 
						on:click={() => goto(`/admin/projects/epic-create/${projectId}`)}
						>Create Epic
					</button>					
				</div>
			</div>
			<div class="px-3 w-full rounded-md flex flex-col sm:flex-row justify-between">
				<div class="mr-2 flex flex-row sm:flex-col justify-between sm:justify-normal w-full">
					<div class="prose font-bold text-xl sm:w-60">Epic title</div>
					<div class="text-sm opacity-50">Tasks count</div>
				</div>
				<div class="divider divider-horizontal"></div>
				<div class="mr-2 text-left w-full">
					<div class="inline sm:hidden prose text-sm badge-md badge badge-secondary">Progress</div>
					<div class="hidden sm:inline prose font-bold text-xl">Progress</div>
					<progress
						class="progress progress-primary sm:w-56 m-0 mr-auto ml-0 hidden sm:inline"
						value="0"
						max="100"
					></progress>
				</div>
				<div class="divider divider-horizontal"></div>
				<div class="mr-2 hidden sm:inline w-full">
					<div class="prose font-bold text-xl text-left">Create/Update date</div>
				</div>
			</div>

			<div class="divider divider-neutral m-0 mb-2" />
			<!-- for loop -->
			<!-- row-content -->

			<!-- {#each sortedList.filter(matches) as item} -->
			{#if epics != null}
				{#each epics as epic}
				<a
						href="/admin/epics/{epic?._id}"
						
					>
					<!-- class="flex flex-col sm:flex-row align-baseline p-2 sm:p-3 rounded-md w-full hover:bg-neutral-100 hover:shadow-md transition ease-out hover:-translate-y-1 hover:scale-100 active:bg-slate-200 hover:border-y-[2px] hover:border-slate-200" -->
					<div class="p-1 sm:p-0">
						<button
							class="flex flex-col justify-between sm:flex-row align-baseline p-2 sm:p-3 rounded-md w-full hover:bg-neutral-100 hover:shadow-md transition ease-out hover:-translate-y-1 hover:scale-100 active:bg-slate-200 hover:border-y-[2px] hover:border-slate-200"
							><!-- Admin should not have access to Epics, only view them as list items -->
							<div class="mr-2 flex flex-row sm:flex-col justify-between sm:justify-center w-full">
								<div class="font-bold text-xl sm:w-60 text-left truncate">{epic?.title}</div>
								<div class="text-sm opacity-50 sm:w-60 text-left">{epic.tasks.length}</div>
							</div>
							<div class="divider divider-horizontal"></div>
							<div class="flex justify-center flex-col gap-y-2 mr-2 w-full">
								<span class="badge badge-secondary badge-md mr-auto ml-0">{ProgressCaculation(epic, epic.tasks.length)}%</span>
								<progress
									class="progress progress-primary w-full m-0 mr-auto ml-0"
									value={ProgressCaculation(epic, epic.tasks.length)}
									max="100"
								></progress>
							</div>
							<div class="divider divider-horizontal"></div>
							<div
								class="w-full mr-2 flex text-left flex-row gap-3 sm:flex-col sm:justify-center text-sm sm:text-md opacity-50 sm:opacity-100"
							>
								<div class="sm:w-60">
									<b class="hidden sm:inline">Create date:</b>
									{ConvertDate(epic.createdAt)}
								</div>
								<div class="sm:w-60 text-left">
									<b class="hidden sm:inline">Update date:</b>
									{ConvertDate(epic.updatedAt)}
								</div>
							</div>
						</button>
					</div>
				</a>
				{/each}
			{:else}
			No content
			{/if}
		</div>
	</div>
</div>

<style>
	:global(.carta-theme__default .carta-input, .carta-theme__default .carta-renderer) {
		max-height: 350px;
	}
	:global(.carta-editor) {
		width: 99%;
		/* this forces the upper toolbar to resize to screen, 
			thus making the container fit to screen without side scroll */
	}
	:global(.carta-wrapper > ul, .carta-viewer > ul) {
		/* reset list styling to default-ish */
		margin-left: 2rem;
		/* Remove the @apply directive */
		list-style-type: disc;
	}
	:global(.carta-wrapper > a, .carta-viewer > a) {
		/* reset link styling to default-ish */
		color: #007bff;
		text-decoration: underline;
	}
</style>
