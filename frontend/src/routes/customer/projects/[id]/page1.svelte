<script>
	import { goto } from '$app/navigation';
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

    //Get Id from +page.server.js
    export let data;
    var project = data.props.project;
	var epics = data.props.epics;
	var employees = data.props.employees;
</script>

<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
	<h1 class="text-white text-center">{project.title}</h1>
	<p class="text-white">{project.description}</p>
	<button
        on:click={() => goto(`/admin/project/epic-create/${project._id}`)}
        type="button"
        class="flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg dark:bg-primary-600 dark:hover:bg-primary-700 bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 focus:outline-none dark:focus:ring-primary-800"
    >
	Create epic
	</button>
	<button
        on:click={() => goto(`/admin/project/chat/${project._id}`)}
        type="button"
        class="flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg dark:bg-green-600 dark:hover:bg-green-700 bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 focus:outline-none dark:focus:ring-green-800"
    >
	To Chat
	</button>
	{#if epics}
		{#each epics as epic}
			<div  class="w-full text-sm text-left rtl:text-right  text-xs text-gray-700 uppercase bg-gray-300 dark:bg-green-300 px-6 py-4"> 
				{epic.title}
				<div class="text-right">
					<button on:click={() => goto(`/admin/task/${epic._id}`)}>
						Create new Task 
					</button>
				</div>			
			</div>   	
				<table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
					<thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
						<tr>
							<th scope="col" class="px-6 py-4"> Title </th>
							<th scope="col" class="px-6 py-4"> Status</th>
							<th scope="col" class="px-6 py-4"> Member</th>
						</tr>
					</thead>
					<tbody>
						{#each epic.tasks as task}
						
						<tr
							class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
						>
							<!-- <th
								scope="row"
								class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
							>
								
								
							</th>	 -->
							<td class="px-6 py-4">{task.title}</td>		
							<td class="px-6 py-4">{task.status}</td>
							<td class="px-6 py-4">	
									
								{#if task.members}
								
									<div class="flex -space-x-4 rtl:space-x-reverse">
									
									{#each task.members as memberId}									
										{#each employees as employee}
											{#if employee.employee_id === memberId}		
																																				
												<img class="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800" 
													src="/images/profile/{employee.profile_image}" alt="">												
																								
											{/if}
										{/each}									
									{/each}		
									
									<!-- svelte-ignore a11y-invalid-attribute -->
									<a class="flex items-center justify-center w-10 h-10 text-xs font-medium text-white bg-gray-700 border-2 border-white rounded-full hover:bg-gray-600 dark:border-gray-800" href="#">...</a>					
								</div>
								{/if}
							</td>
						</tr>		
						{/each}
					</tbody>
				</table>		
		{/each}
	{/if}
</div>