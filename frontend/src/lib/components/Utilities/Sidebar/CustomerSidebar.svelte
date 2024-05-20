<script>
	import { page } from '$app/stores';
</script>

<ul class="menu shadow bg-base-100 mt-2 rounded-lg dropdown-content w-fit">
	<li>
		<a class="pl-1" class:btn-active={$page.url.pathname === '/customer'} href="/customer">Dashboard</a>
		<ul>
			<li>
				<a
					class="pl-1"
					class:btn-active={$page.url.pathname === '/customer/projects'}
					href="/customer/projects">Projects</a
				>
			</li>
		</ul>
	</li>
</ul>
