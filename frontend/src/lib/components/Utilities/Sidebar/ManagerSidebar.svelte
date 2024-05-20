<script>
	import { page } from '$app/stores';
</script>

<ul class="menu shadow bg-base-100 mt-2 rounded-lg dropdown-content w-fit">
	<li>
		<a class="pl-1" class:btn-active={$page.url.pathname === 'manager'} href="/manager"
			>Dashboard</a
		>
		<ul>
			<li>
				<a
					class="pl-1"
					class:btn-active={$page.url.pathname === '/manager/projects'}
					href="/manager/projects">Project</a
				>
				<a
					class="pl-1"
					class:btn-active={$page.url.pathname === '/manager/epics'}
					href="/manager/epics">Epics</a
				>
				<a
					class="pl-1"
					class:btn-active={$page.url.pathname === '/manager/tasks'}
					href="/manager/tasks">Tasks</a
				>
				<a
					class="pl-1"
					class:btn-active={$page.url.pathname === '/manager/employees'}
					href="/manager/employees">Employees</a
				>
			</li>
		</ul>
	</li>
</ul>
