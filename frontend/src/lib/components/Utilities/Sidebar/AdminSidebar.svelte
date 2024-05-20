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
					class:btn-active={$page.url.pathname === '/admin/projects'}
					href="/admin/projects">Projects</a
				>
				<a class="pl-1" class:btn-active={$page.url.pathname === '/admin/auth/accounts'} href="/admin/auth/accounts"
					>Accounts</a
				>
                <a class="pl-1" class:btn-active={$page.url.pathname === '/admin/auth/authorization'} href="/admin/auth/authorization"
                    >Authorization</a
                >
				
			</li>
		</ul>
	</li>
</ul>
