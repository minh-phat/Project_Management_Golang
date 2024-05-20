<!-- <ul class="menu shadow bg-base-100 mt-2 rounded-lg dropdown-content w-fit">
	<li><a href="/">Item 1</a></li>
	<li>
		<a href="/">Parent</a>
		<ul>
			<li><a href="/">Submenu 1</a></li>
			<li><a href="/">Submenu 2</a></li>
			<li>
				<a href="/">Parent</a>
				<ul>
					<li><a href="/">Submenu 1</a></li>
					<li><a href="/">Submenu 2</a></li>
				</ul>
			</li>
		</ul>
	</li>
	<li><a href="/">Item 3</a></li>
</ul> -->

<ul class="menu shadow bg-base-100 mt-2 rounded-lg dropdown-content w-fit sm:w-full">
	<li>
		<a class="pl-1" href="admin/auth">Auth</a>
		<ul>
			<li><a class="pl-1" href="admin/auth/authorization">Authorization</a></li>
			<li><a class="pl-1" href="admin/auth/accounts">Accounts</a>
				<ul>
					<li><a class="pl-1" href="admin/auth/accounts?filter=manager">Managers</a></li> 		<!-- This will be adding a filter towards managers only -->
					<li><a class="pl-1" href="admin/auth/accounts?filter=employee">Employees</a></li>		<!-- same here -->
				</ul>
			</li>
		</ul>
	</li>
	<li><a href="/">Item 3</a></li>
</ul>
