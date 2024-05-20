<script>
	export let depth = '';

	export let show = '';

	//tách phần tử thành array sau đó loại bỏ phần tử rỗng đầu tiên bắng slice(1)
	const showArray = show.split('||');
	// console.log("showArray", showArray)
</script>

<div class="-ml-16 sm:ml-5 mt-5 z-0 w-fit h-fit bg-base-100 rounded-md rounded-b-none px-5">
	<div class="text-sm breadcrumbs">
		<ul>
			<li>
				<a href="/admin">Dashboard</a>
			</li>
			<!-- generate breadcrumb by depth input above -->
			{#if depth !== ''}
				{#each depth.split('||') as part, i}
					<li>
						<a
							href="/admin{part}">{showArray[i]}</a
						>
					</li>
				{/each}
			{/if}
		</ul>
	</div>
</div>
