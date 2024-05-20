<script>
	import { form, field } from "svelte-forms";
	import { required } from "svelte-forms/validators";
	import toast, { Toaster } from "svelte-french-toast";
	import axios from "axios";
	import { onMount } from "svelte";
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
	var authorizationData;

	var authorization;
	var description;
	var authorizationForm;
	var loading = true;

	onMount(async () => {
		try {
			const response = await axios.get(`/authorization/${data.props.id}`, {
				withCredentials: true
			});
			if (response.data.success === true) {
				authorizationData = await response.data.authorization;
				authorization = field("authorization", authorizationData.LevelName, [required()]);
				description = field("description", authorizationData.Description);
				authorizationForm = form(authorization, description);
				loading = false;
			}
		} catch {
			window.location.href = "http://localhost:5173/";
		}
	});

	async function HandleSubmit(event) {
		event.preventDefault();

		try {
			const response = await axios.put(`/authorization/${data.props.id}`, {
				levelName: $authorization.value,
				description: $description.value,
				withCredentials: true
			});
			const success = await response.data.success;
			const message = await response.data.message;
			if (success === true) {
				toast.success(message);
				await new Promise((resolve) => setTimeout(resolve, 3000));
				window.location.replace("http://localhost:5173/admin/auth/authorization");
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
	{#if loading === false}
		<div class="py-2 px-4 mx-auto max-w-4xl lg:py-8">
			<h2 class="text-xl text-center font-bold text-gray-900 dark:text-white">
				Update authorization
			</h2>
			<Toaster position="bottom-right" />
			<form on:submit={HandleSubmit} class="rounded-sm p-8">
				<div class="grid gap-4 sm:grid-cols-2 sm:gap-6">
					<div class="sm:col-span-2">
						<label
							for="authorization"
							class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
							>Authorization</label
						>
						<input
							bind:value={$authorization.value}
							type="text"
							name="authorization"
							class={`bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 ${$authorizationForm.hasError("authorization.required") ? "border-red-500 text-red-600 placeholder-red-600 focus:border-red-500 dark:border-red-500 dark:text-red-600 dark:placeholder-red-600 dark:focus:border-red-500" : ""}`}
							placeholder="Authorization level name"
							required
						/>
						{#if $authorizationForm.hasError("authorization.required")}
							<p class="mt-2 text-base text-red-600 dark:text-red-500">Authorization is required</p>
						{/if}
					</div>
					<div class="sm:col-span-2">
						<label
							for="description"
							class="block mb-2 text-base font-bold text-gray-900 dark:text-white"
							>Description</label
						>
						<textarea
							bind:value={$description.value}
							name="description"
							rows="5"
							class="block p-2.5 w-full text-base text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
							placeholder="Authorization description"
						></textarea>
					</div>
				</div>
				<div class="flex justify-center">
					<button
						type="submit"
						on:click={authorizationForm.validate}
						disabled={$authorizationForm.valid ? false : true}
						class="px-5 py-2.5 mt-4 mr-2 sm:mt-6 text-base font-medium text-center text-white bg-green-700 rounded-lg focus:ring-4 focus:ring-green-200 dark:focus:ring-green-900 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Update authorization
					</button>
					<a href="../authorization" class="hover:no-underline">
						<button
							class="px-5 py-2.5 mt-4 ml-2 sm:mt-6 text-base font-medium text-center text-white bg-red-700 rounded-lg focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900 hover:bg-red-800"
						>
							Cancel
						</button>
					</a>
				</div>
			</form>
		</div>
	{/if}
</section>
