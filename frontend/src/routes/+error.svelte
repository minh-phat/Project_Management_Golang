<script>
	import { page } from '$app/stores';
</script>

<div class="toast toast-center toast-middle">
	<div class="alert alert-error text-center text-white font-bold text-2xl">
	  <span>{$page.error.message}</span>
	</div>
</div>