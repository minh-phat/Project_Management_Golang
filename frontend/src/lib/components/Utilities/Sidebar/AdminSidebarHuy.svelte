<script>
	import { page } from '$app/stores';
</script>

<ul class="menu shadow bg-base-100 mt-2 rounded-lg dropdown-content w-fit">
	<li>
		<a class="pl-1" class:btn-active={$page.url.pathname === '/admin'} href="/admin">Dashboard</a>
		<ul>
			<li>
				<a
					class="pl-1"
					class:btn-active={$page.url.pathname === '/admin/project'}
					href="/admin/project">Projects</a
				>
				<a class="pl-1" class:btn-active={$page.url.pathname === '/admin/auth'} href="/admin/auth"
					>Auth</a
				>

				<ul>
					<li>
						<a
							class:btn-active={$page.url.pathname === '/admin/auth/authorization'}
							class="pl-1"
							href="/admin/auth/authorization">Authorization</a
						>
					</li>
					<li>
						<a
							class:btn-active={$page.url.pathname === '/admin/auth/accounts'}
							class="pl-1"
							href="/admin/auth/accounts">Accounts</a
						>
						<ul>
							<li>
								<a
									class="pl-1"
									class:btn-active={$page.url.pathname === '/admin/auth/accounts?filter=employee'}
									href="/admin/auth/accounts?filter=employee">Employees</a
								>
							</li>
							<!-- same here -->
							<li>
								<a
									class="pl-1"
									class:btn-active={$page.url.pathname === '/admin/auth/accounts?filter=manager'}
									href="/admin/auth/accounts?filter=manager">Managers</a
								>
							</li>
							<!-- This will be adding a filter towards managers only -->
							<li>
								<a
									class="pl-1"
									class:btn-active={$page.url.pathname === '/admin/auth/accounts?filter=admin'}
									href="/admin/auth/accounts?filter=admin">Admins</a
								>
							</li>
							<!-- This will be adding a filter towards managers only -->
						</ul>
					</li>
				</ul>
			</li>
		</ul>
	</li>
</ul>
