<script>
	import axios from "axios";

	export let headerName;
	export let accountName;
	export let headerSrc;
	export let profileImage;
	export let employeeID

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


	let svg;
	let profile_div;

	function toggle() {
		svg.classList.toggle('rotate-90');

		//make the profile div slide down and up

		if (profile_div.style.transform === 'translateY(75px)') {
			profile_div.style.transform = 'translateY(0px)';
			profile_div.style.opacity = '1';
		} else {
			profile_div.style.transform = 'translateY(75px)';
			profile_div.style.opacity = '0';
		}
	}

	// Function to handle logging out of the system
	function logOut() {
		axios
			.get("/logout", { withCredentials: true })
			.then((response) => {
				if (response.data.success === true && response.data.message === "Logout successful") {
					window.location.href = "http://localhost:5173/";
				}
			})
			.catch((error) => {
				// Handle any errors that occurred during the request
				console.error(error);
			});
	}
</script>

<div class="navbar rounded-r-lg bg-secondary py-1 pr-5 m-0 text-neutral">
	<!--leftmost title-->

	<div class="flex-1">
		<a href="/{headerSrc}" class="btn btn-ghost bord text-base sm:text-xl">{headerName}</a>
	</div>
	<div class="flex-none text-right">
		<!--upper pfp & title,name-->

		<div class="overflow-hidden p-0">
			<div class=" inline-flex transition duration-300 ease-in-out" bind:this={profile_div}>
				<div class="profile-title-name m-1 hidden sm:block">
					<!-- Title & name -->
					<h1 class="text-l font-bold leading-4">Admin</h1>
					<!-- <h1 class="text-l font-bold leading-4">{data.authlevel}</h1> -->
					<!-- !replace data here like this, auth should be read from the store-->
					<p class="text-sm leading-4">{accountName}</p>
					<!-- Title & name -->
				</div>
				<div class="rounded-sm avatar mr-2">
					<div class="outline outline-1 outline-neutral w-10 rounded-full">
						<!-- PFP image -->
						<img alt="Tailwind CSS Navbar component" src="/images/profile/{profileImage}" />
						<!-- PFP image -->
					</div>
				</div>
			</div>
		</div>

		<!-- setting dropdown -->

		<details class="dropdown dropdown-end profile-dropdown">
			<summary
				tabindex="0"
				class="btn btn-secondary rounded-md py-0 px-1 transition duration-200 ease-in-out"
				on:click={toggle}
			>
				<svg
					id="settingBtnSVG"
					xmlns="http://www.w3.org/2000/svg"
					fill="currentColor"
					class="w-10 h-10 bi bi-gear-fill text-neutral transition ease-out duration-200"
					viewBox="0 0 16 16"
					bind:this={svg}
				>
					<path
						d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"
					/>
				</svg>
			</summary>
			<ul
				tabindex="-1"
				class="menu menu-xs sm:menu-sm dropdown-content mt-5 -mr-5 z-[1] p-2 shadow-lg bg-base-100 rounded-xl w-auto transition-transform"
			>
				<!-- screw this way of disabling onclick -->

				<li style="pointer-events: none;">
					<div class="flex-none text-right">
						<div class=" rounded-sm avatar">
							<div class="outline outline-1 outline-neutral w-10 rounded-full">
								<img alt="Tailwind CSS Navbar component" src="/images/profile/{profileImage}" />
							</div>
						</div>
						<div class="profile-title-name m-0">
							<h1 class="text-left text-lg font-bold leading-4">HR</h1>
							<p class="text-sm leading-4">{accountName}</p>
						</div>
					</div>
				</li>
				<li><a href="/profile/{employeeID}">Profile</a></li>
				<!-- svelte-ignore a11y-missing-attribute -->
				<li><a><button on:click={logOut}>Logout</button></a></li>
				<li class=" hover:bg-neutral-100">
					<label class="flex cursor-pointer gap-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><circle cx="12" cy="12" r="5" /><path
								d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
							/></svg
						>
						<input type="checkbox" value="synthwave" class="toggle theme-controller" checked/>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg
						>
					</label>
				</li>
			</ul>
		</details>
	</div>
</div>
