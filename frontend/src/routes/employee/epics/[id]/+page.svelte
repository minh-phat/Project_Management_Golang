<script>
	import toast, { Toaster } from "svelte-french-toast";
	import Breadcrumb from '../../Breadcrumb.svelte';
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
	var GetTask = data.props.tasks;

	//Display fields
	var title = epic.title;
	var value = epic.description; //Description field

	// add id into array , this id coincides with _id
	const tasks = GetTask?.map(item => {
        return { ...item, id: item._id };
    });
	//count total tasks
	let totalTasksCount = tasks.length;

	let completedTasks = tasks.filter((task) => task.status === "Completed");
	let inProgressTasks = tasks.filter((task) => task.status === 'In Progress');
	let toDoTasks = tasks.filter((task) => task.status === 'To Do');

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

<Breadcrumb depth="epics/{epic.title}" />
<Toaster position="bottom-right" />

<div class="-ml-16 sm:ml-5 mt-0 z-0 h-fit bg-base-100 rounded-md p-5 rounded-tl-none">
	<div class="flex w-auto flexcol justify-between">
		
			<h1 class="prose -mb-3 font-bold text-2xl sm:text-3xl text-left pl-3">
				{title}
			</h1>
	</div>
	<div class="overflow-x-auto mt-3 p-3 bg-neutral-200 rounded-md">
		<div class=" p-3 rounded bg-base-100 w-auto markdown">
			<p class="font-medium text-md mb-2">Epic description:</p>
			<div class="w-full">				
				{#if value !== ''}
					<Markdown {carta} {value} />
				{:else}
					<p>No description</p>
				{/if}	
			</div>
		</div>

		<div class="divider divider-neutral m-0 mb-2 mt-4" />
		<h1 class="prose font-bold text-lg sm:text-xl text-left">Available tasks</h1>
		<div class="flex flex-row gap-2 opacity-55">
			<p>Total Tasks: {totalTasksCount}</p>
			<p>Completed: {completedTasks.length} / {totalTasksCount}</p>
		</div>
		<div class="flex sm:flex-row flex-col-reverse sm:gap-2 mb-3">
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
		<div class="flex flex-row">
			<div class="flex flex-col w-full bg-neutral-100 rounded">
				<div class="w-full p-5 h-auto">
					<h2 class="prose text-xl font-bold p-3">To-Do Tasks</h2>
					<div
						class="flex flex-col gap-2 min-h-40 h-auto"					
					>
					{#if toDoTasks != null}
						{#each toDoTasks.filter(matches) as item (item.id)}
							<button								
								style:background-color={generateColor(item.title)}
								class="flex flex-row gap-2 p-3 bg-neutral-100 w-full text-start rounded border-[3px] hover:shadow-lg hover:-translate-y-1 hover:border-primary transition-translation duration-200 ease-out"
							>
								<div class="flex flex-col w-full">
									<div class="flex flex-row items-center justify-between gap-2">
										<p class="font-bold text-lg">{item.title}</p>
										<p class="text-md badge badge-outline">To Do</p>
									</div>
									<p class="text-md">{item.description}</p>
									<div class="text-md">
										<div class="avatar-group -space-x-6 rtl:space-x-reverse">
											{#if item.members != null}
												{#each item.members as _, index}
													{#if index < 3}
														<div class="avatar">
															<div class="w-12">
																<img
																	alt="avatar"
																	src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
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
												{/each}
											{/if}
										</div>
									</div>
									<!-- {item.Attachments.length} -->
									<p class="text-md">Attachments: </p>
									<div class="flex flex-row gap-2">
										<p class="text-md">{ConvertDate(item.createdAt)}</p>
										<p class="text-md">{ConvertDate(item.updatedAt)}</p>
									</div>
								</div>
							</button>
						{/each}
					{/if}
					</div>
					
				</div>
			</div>
			<div class="divider divider-horizontal" />

			<div class="flex flex-col w-full bg-neutral-100 rounded">
				<div class="w-full p-5 h-auto">
					<h2 class="prose text-xl font-bold p-3">In-Progress tasks</h2>
					<div
						class="flex flex-col gap-2 h-auto min-h-40"
					>
					{#if inProgressTasks != null}
						{#each inProgressTasks.filter(matches) as item (item.id)}
							<button
								on:click={handleClick}
								style:background-color={generateColor(item.title)}
								class="flex flex-row gap-2 p-3 bg-neutral-100 w-full text-start rounded border-[3px] hover:shadow-lg hover:-translate-y-1 hover:border-primary transition-translation duration-200 ease-out"
							>
								<div class="flex flex-col w-full">
									<div class="flex flex-row items-center justify-between gap-2">
										<p class="font-bold text-lg">{item.title}</p>
										<p class="text-md badge badge-info">In Progress</p>
									</div>
									<p class="text-md">{item.description}</p>
									<div class="text-md">
										<div class="avatar-group -space-x-6 rtl:space-x-reverse">
											{#if item.members != null}
												{#each item.members as _, index}
													{#if index < 3}
														<div class="avatar">
															<div class="w-12">
																<img
																	alt="avatar"
																	src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
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
												{/each}
											{/if}
										</div>
									</div>
									<p class="text-md">Attachments: </p>
									<div class="flex flex-row gap-2">
										<p class="text-md">{ConvertDate(item.createdAt)}</p>
										<p class="text-md">{ConvertDate(item.updatedAt)}</p>
									</div>
								</div>
							</button>
						{/each}
					{/if}
					</div>
				</div>
			</div>

			<div class="divider divider-horizontal" />
			<div class="flex flex-col w-full bg-neutral-100 rounded">
				<div class="w-full p-5 h-auto">
					<h2 class="prose text-xl font-bold p-3">Completed tasks</h2>
					<div
						class="flex flex-col min-h-40 gap-2 h-auto"
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
									<p class="text-md">{item.description}</p>
									<div class="text-md">
										<div class="avatar-group -space-x-6 rtl:space-x-reverse">
											{#if item.members != null}
												{#each item.members as _, index}
													{#if index < 3}
														<div class="avatar">
															<div class="w-12">
																<img
																	alt="avatar"
																	src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
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
												{/each}
											{/if}
										</div>
									</div>
									<p class="text-md">Attachments:</p>
									<div class="flex flex-row gap-2">
										<p class="text-md">{ConvertDate(item.createdAt)}</p>
										<p class="text-md">{ConvertDate(item.updatedAt)}</p>
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
