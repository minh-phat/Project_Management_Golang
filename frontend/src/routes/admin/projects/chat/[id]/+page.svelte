<script>
	import { onMount } from "svelte";
	import { io } from "socket.io-client";
	import { error } from "@sveltejs/kit";
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

	var currentUser = data.props.currentUser;
	var project = data.props.project;
	var allowedAccounts = data.props.allowedAccounts;
	var message = "",
		files = [],
		messages = data.props.messages === null ? [] : data.props.messages;

	var socket;

	async function CheckAuth() {
		if (!allowedAccounts.includes(currentUser._id)) {
			throw error(401, {
				message: "You are unauthorized to access this resource."
			});
		}
	}

	onMount(async () => {
		await CheckAuth();
		socket = io();

		socket.emit("init", project._id);

		socket.on("message", async (message) => {
			var response = await axios.get(`/get-message-by-id/${message}`);
			if (response.data.success === true) {
				messages = [...messages, response.data.message];
			}
		});
	});

	async function SendMessage() {
		var filePaths = [],
			initialFiles = [];
		var response = await axios.get("isAuthorized");
		if (response.data.success === true) {
			if (files !== null && files !== undefined && files.length > 0) {
				for (let i = 0; i < files.length; i++) {
					// Prepare data for each file to upload
					const formData = new FormData();
					formData.append("file", files[i]);
					formData.append("folderPath", "/chatAttachments");
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
						initialFiles.push(files[i].name);
					} else {
						break;
					}
				}
			}

			var response = await axios.post("/create-message", {
				sender: currentUser._id,
				message: message,
				files: filePaths,
				initialFiles: initialFiles,
				project: project._id
			});

			if (response.data.success === true) {
				socket.emit("message", response.data.messageId);
				message = "";
			}
		}
	}

	function HandleUploadFile(event) {
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

	async function DownloadZip(files) {
		const formData = new FormData();
		for (const file of files) {
			formData.append("files[]", file);
		}

		try {
			const response = await fetch("/api/downloadZip", {
				method: "POST",
				body: formData
			});

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "download.zip";
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (error) {
			console.error(error);
		}
	}
</script>

<div class="h-full w-full bg-zinc-500 flex flex-col">
	<header
		class="px-6 py-4 border-b border-zinc-800 bg-zinc-700 text-white flex items-center justify-between"
	>
		<span>{currentUser.fullname}</span>
		<span class="font-bold text-xl">{project.title}</span>
		<button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Leave</button
		>
	</header>

	{#if messages === null || messages === undefined || messages == [] || messages.length === 0}
		<div class="flex items-center justify-center h-full">
			<div class="text-center">
				<h1 class="text-2xl font-bold">No messages yet</h1>
				<p class="text-gray-500">Send a message to start the conversation</p>
			</div>
		</div>
	{:else}
		<div class="h-full">
			{#each messages as message}
				{#if message.sender._id === currentUser._id}
					<div class="chat chat-end py-3 px-3">
						<div class="chat-image avatar">
							<div class="w-10 rounded-full">
								<img
									alt="Tailwind CSS chat bubble component"
									src="/images/profile/{currentUser.profile_image}"
								/>
							</div>
						</div>
						<div class="chat-header">
							{currentUser.fullname}
						</div>
						{#if message.files !== null && message.files !== undefined && message.files.length === 1}
							{#if message.files[0].split(".").pop() === "png" || message.files[0]
									.split(".")
									.pop() === "jpg" || message.files[0].split(".").pop() === "jpeg"}
								<div class="chat-bubble">
									<img src="/chatAttachments/{message.files[0]}" alt="Chat media" />
									{#if message.message !== null && message.message !== undefined && message.message !== ""}
										<div>{message.message}</div>
									{/if}
								</div>
							{:else if message.files[0].split(".").pop() === "pdf"}
								<div class="chat-bubble">
									<button
										on:click|preventDefault={() =>
											window.open(
												`/chatAttachments/${message.files[0]}`,
												"_blank",
												`width=${window.innerWidth}, height=${window.innerHeight}`
											)}><i class="fa-solid fa-file-pdf"></i></button
									>
									<button
										class="underline underline-offset-2"
										on:click|preventDefault={() =>
											window.open(
												`/chatAttachments/${message.files[0]}`,
												"_blank",
												`width=${window.innerWidth}, height=${window.innerHeight}`
											)}>{message.initialFiles[0]}</button
									>
									{#if message.message !== null && message.message !== undefined && message.message !== ""}
										<div>{message.message}</div>
									{/if}
								</div>
								<!-- Handle open view PDF -->
							{:else}
								<div class="chat-bubble">
									<a href="/chatAttachments/{message.files[0]}" download
										><i class="fa-solid fa-download"></i></a
									>
									<a
										href="/chatAttachments/{message.files[0]}"
										class="underline underline-offset-2"
										download>{message.initialFiles[0]}</a
									>
									{#if message.message !== null && message.message !== undefined && message.message !== ""}
										<div>{message.message}</div>
									{/if}
								</div>
								<!-- Handle download file -->
							{/if}
						{:else if message.files !== null && message.files !== undefined && message.files.length > 1}
							<div class="chat-bubble">
								<button on:click|preventDefault={DownloadZip(message.files)}
									><i class="fa-solid fa-file-zipper"></i></button
								>
								<button
									class="underline underline-offset-2"
									on:click|preventDefault={DownloadZip(message.files)}
									>{message.files.length} files</button
								>
								{#if message.message !== null && message.message !== undefined && message.message !== ""}
									<div>{message.message}</div>
								{/if}
							</div>
						{:else if message.message !== null && message.message !== undefined && message.message !== ""}
							<div class="chat-bubble">{message.message}</div>
						{/if}
						<div class="chat-footer opacity-50">
							{new Date(parseInt(message.createdAt) * 1000).toLocaleString("en-UK")}
						</div>
					</div>
				{:else}
					<div class="chat chat-start py-3 px-3">
						<div class="chat-image avatar">
							<div class="w-10 rounded-full">
								<img
									alt="Tailwind CSS chat bubble component"
									src="/images/profile/{message.senderUserInfor.profile_image}"
								/>
							</div>
						</div>
						<div class="chat-header">
							{message.senderUserInfor.fullname}
						</div>
						{#if message.files !== null && message.files !== undefined && message.files.length === 1}
							{#if message.files[0].split(".").pop() === "png" || message.files[0]
									.split(".")
									.pop() === "jpg" || message.files[0].split(".").pop() === "jpeg"}
								<div class="chat-bubble">
									<img src="/chatAttachments/{message.files[0]}" alt="Chat media" />
									{#if message.message !== null && message.message !== undefined && message.message !== ""}
										<div>{message.message}</div>
									{/if}
								</div>
							{:else if message.files[0].split(".").pop() === "pdf"}
								<div class="chat-bubble">
									<button
										on:click|preventDefault={() =>
											window.open(
												`/chatAttachments/${message.files[0]}`,
												"_blank",
												`width=${window.innerWidth}, height=${window.innerHeight}`
											)}><i class="fa-solid fa-file-pdf"></i></button
									>
									<button
										class="underline underline-offset-2"
										on:click|preventDefault={() =>
											window.open(
												`/chatAttachments/${message.files[0]}`,
												"_blank",
												`width=${window.innerWidth}, height=${window.innerHeight}`
											)}>{message.initialFiles[0]}</button
									>
									{#if message.message !== null && message.message !== undefined && message.message !== ""}
										<div>{message.message}</div>
									{/if}
								</div>
								<!-- Handle open view PDF -->
							{:else}
								<div class="chat-bubble">
									<a href="/chatAttachments/{message.files[0]}" download
										><i class="fa-solid fa-download"></i></a
									>
									<a
										href="/chatAttachments/{message.files[0]}"
										class="underline underline-offset-2"
										download>{message.initialFiles[0]}</a
									>
									{#if message.message !== null && message.message !== undefined && message.message !== ""}
										<div>{message.message}</div>
									{/if}
								</div>
								<!-- Handle download file -->
							{/if}
						{:else if message.files !== null && message.files !== undefined && message.files.length > 1}
							<div class="chat-bubble">
								<button on:click|preventDefault={DownloadZip(message.files)}
									><i class="fa-solid fa-file-zipper"></i></button
								>
								<button
									class="underline underline-offset-2"
									on:click|preventDefault={DownloadZip(message.files)}
									>{message.files.length} files</button
								>
								{#if message.message !== null && message.message !== undefined && message.message !== ""}
									<div>{message.message}</div>
								{/if}
							</div>
						{:else if message.message !== null && message.message !== undefined && message.message !== ""}
							<div class="chat-bubble">{message.message}</div>
						{/if}
						<div class="chat-footer opacity-50">
							{new Date(parseInt(message.createdAt) * 1000).toLocaleString("en-UK")}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}

	<form
		on:submit|preventDefault={SendMessage}
		class="px-6 py-4 border-t border-zinc-800 bg-zinc-700 text-white shrink-0 flex items-center space-between gap-2"
	>
		<div class="flex items-center justify-center w-60">
			<input
				id="dropzone-file"
				name="file"
				type="file"
				multiple
				bind:files
				on:change={HandleUploadFile}
			/>
		</div>
		<input
			type="text"
			class="bg-gray-50 border border-gray-300 py-4 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
			placeholder="Aa"
			name="message"
			bind:value={message}
		/>
		<button type="submit" class="shrink-0 border border-white rounded-lg px-4 py-3">Send</button>
	</form>
</div>
