<script>
    import toast, { Toaster } from "svelte-french-toast";
	import Breadcrumb from "$lib/components/Breadcrumb/AdminBreadcrumb.svelte";
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
    
    var GetProjectID = data.props.ProjectID;
	var project = data.props.Project;
    
    var title ,
        description;

    async function CreateEpic(event){             
       	event.preventDefault();
        axios
            .post("/epic",{
                project: GetProjectID,                   
                title: title,                         
                description: description,
            }).then(function(response) {
                toast.success("Create epic success");
            }).catch(function(error) {
                toast.error("Create epic failed");

            });              
        
    }
</script>
<!-- Bread crumb dùng để điều hướng về trang trước đó 
	depth link điều hướng 
	show là tên hiện ra tương ứng với link điều hướng 
-->
<Breadcrumb depth="projects/{GetProjectID}" show="{project.title}"/>

<section class="bg-transparent dark:bg-gray-900">
	<div class="py-2 px-4 mx-auto max-w-4xl lg:py-8">
		<h2 class="text-xl text-center font-bold text-gray-900 dark:text-white">Add epic</h2>
		<Toaster position="bottom-right" />
		<form on:submit={CreateEpic} class="rounded-sm p-8">
			<div class="grid gap-4 sm:grid-cols-2 sm:gap-6">
				<div class="sm:col-span-2">
					<label
						for="title"
						class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
						>Title</label
					>
					<input
						bind:value={title}
						type="text"
						name="title"
						class={"bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 "}
						placeholder="Title"
						required
					/>
					
				</div>
				<div class="sm:col-span-2">
					<label
						for="description"
						class="block mb-2 text-base font-bold text-gray-900 dark:text-white">Description</label
					>
					<textarea
						bind:value={description}
						name="description"
						rows="5"
						class="block p-2.5 w-full text-base text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
						placeholder="Description"
					></textarea>
				</div>
			</div>
			<div class="flex justify-center">
				<button
					type="submit"
					
					class="px-5 py-2.5 mt-4 mr-2 sm:mt-6 text-base font-medium text-center text-white bg-green-700 rounded-lg focus:ring-4 focus:ring-green-200 dark:focus:ring-green-900 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Add Epic
				</button>
				<a href="../{GetProjectID}" class="hover:no-underline">
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
