<script>
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	export let message = "Are you sure?";
	export let okText = "OK";
	export let cancelText = "Cancel";
	export let object = "";

	function handleOK() {
		dispatch("ok");
	}

	function handleCancel() {
		dispatch("cancel");
	}
</script>

<div class="modal">
	<div class="modal-content">
		<p>{message}{object}</p>
		<div class="button-container">
			<button on:click={handleOK}>{okText}</button>
			<button on:click={handleCancel}>{cancelText}</button>
		</div>
	</div>
</div>

<style>
	/* Modal styles */
	.modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.modal-content {
		background-color: white;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
	}

	/* Button container styles */
	.button-container {
		display: flex;
		justify-content: space-between;
	}

	/* Button styles */
	button {
		padding: 8px 16px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
</style>
