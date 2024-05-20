
<script>
	import Navbar from '$lib/components/Utilities/Navbar.svelte';
	import Sidebar from '$lib/components/Utilities/Sidebar/CustomerSidebar.svelte';
    import "$lib/styles/app.css";
	let openToggle = false;
	if (typeof window !== 'undefined') {
		openToggle = true;
		window.addEventListener('resize', () => {
			if (window.innerWidth > 640) {
				openToggle = true;
			} else {
				openToggle = false;
			}
		});
	}
	// Get the store value passed from server
	export let data;
	// Store the currently logged in user
	var currentUser = data.props.currentUser;

</script>
<div class="page-container flex h-auto">
	<div class="z-10 w-16 sm:w-auto">
		<button
			class="hidden sm:flex btn btn-secondary p-5 h-auto bg-secondary w-40 overflow-hidden border-none rounded-lg rounded-tr-none"
			><img class="object-cover" src="images/mantle-management-high-resolution-logo-transparent.png" alt="logo"></button
		>
		<details class="dropdown-bottom z-10" open={openToggle}>
			<summary class="btn btn-secondary rounded-none rounded-l-lg w-16 h-16 sm:hidden">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					fill="currentColor"
					class="bi bi-list-nested"
					viewBox="0 0 16 16"
				>
					<path
						fill-rule="evenodd"
						d="M4.5 11.5A.5.5 0 0 1 5 11h10a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5m-2-4A.5.5 0 0 1 3 7h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m-2-4A.5.5 0 0 1 1 3h10a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5"
					/>
				</svg>
			</summary>
			<Sidebar />
		</details>
	</div>
	<div class="content-container w-full">
		<Navbar headerName="Customer Dashboard" 
				headerSrc="Customer" 
				accountName={currentUser.account_name} 
				profileImage={currentUser.profile_image}
				employeeID={currentUser._id}/>	
		<slot />
	</div>
</div>