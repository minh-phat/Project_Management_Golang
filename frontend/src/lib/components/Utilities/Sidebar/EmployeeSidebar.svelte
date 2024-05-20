<script>
	import { page } from '$app/stores';
</script>

<ul class="menu shadow bg-base-100 mt-2 rounded-lg dropdown-content w-fit">
	<li>
		<a class="pl-1" class:btn-active={$page.url.pathname === '/employee'} href="/employee">Dashboard</a>
		<ul>
			<li>
				<a
					class="pl-1"
					class:btn-active={$page.url.pathname === '/employee/projects'}
					href="/employee/projects">Projects</a
				>
			</li>
		</ul>
	</li>
</ul>
