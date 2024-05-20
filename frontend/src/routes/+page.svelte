<script>
	import axios from "axios";
	let emailError = " ";
	let passwordError = " ";
	var signInError = " ";

	var username;
	let password;

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

	function signIn() {
		emailError = " ";
		passwordError = " ";
		signInError = " ";
		if (!username) {
			emailError = "Email is required";
			return;
		}
		if (!password) {
			passwordError = "Password is required";
			return;
		}

		axios
			.post("/login", {
				credentials: "include",
				username: username,
				password: password
			})
			.then(function (response) {
				if (response.status === 200) {
					const data = response.data;
					if (data.success === true && data.message === "Login successful") {
						if (data.level === "Manager") {
							window.location.href = "http://localhost:5173/manager";
						} else if (data.level === "Employee") {
							window.location.href = "http://localhost:5173/employee";
						} else if (data.level === "Admin" || data.level === "Administrator") {
							window.location.href = "http://localhost:5173/admin";
						} else {
							window.location.href = "http://localhost:5173/";
						}
					} else {
						signInError = data;
						// toast.error(data.message);
					}
				} else {
					signInError = response.data;
					console.log(signInError);
					// toast.error(response.data.message);
				}
			})
			.catch(function (error) {
				signInError = error.response.data;
				//returns error if email is not valid or password is not valid
				//check if error has value field
				if ("field" in signInError) {
					if (signInError.field === "email") {
						emailError = signInError.message;
					} else if (signInError.field === "password") {
						passwordError = signInError.message;
					}
				}
				// toast.error(error.response.data.message);
			});
	}
</script>
<div class="flex flex-col-reverse md:flex-row justify-center md:gap-32 items-center p-0 h-full">
	<div class="p-5 bg-neutral-100 rounded-md w-80 flex-shrink-0">
		<h1 class="text-4xl text-neutral font-bold w-full mb-4">Sign in</h1>
		<form class="form w-full" on:submit|preventDefault={signIn}>
			<div class="form-group flex flex-col w-full">
				<label for="email" class="text-sm text-neutral">Username or email</label>
				<input
				type="text"
				placeholder="Type here"
				bind:value={username}
				on:focus={() => (emailError = " ")}
				class="input input-bordered w-full input-md form-control border-neutral h-10 border-2 rounded-md focus:border-accent focus:outline-none focus:shadow-md"
				/>
				
				<div class="form-error text-sm text-error">{emailError}</div>
				
				<label for="password" class="text-sm text-neutral mt-3">Password</label>
				<input
				type="password"
				placeholder="Type here"
				bind:value={password}
				on:focus={() => (passwordError = " ")}
				class="input input-bordered w-full input-md form-control border-neutral h-10 border-2 rounded-md focus:border-accent focus:outline-none focus:shadow-md"
				/>
				
				<div class="form-error text-sm text-error">{passwordError}</div>
				
				<button
				type="submit"
				class="btn btn-primary mt-8 mx-5 hover:-translate-y-1 md:mx-10 w-auto text-lg text-neutral rounded-md hover:shadow-md"
				>Sign in</button
				>
			</div>
		</form>
	</div>
	<img src="/images/mantle-management-high-resolution-logo-white-transparent.png" alt="logo" class=" w-64 md:w-[40vw]"/>
</div>