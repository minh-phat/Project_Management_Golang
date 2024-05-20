import { get } from "svelte/store";
import { userStore } from "$lib/stores/userStore.js";

export async function load() {
    const currentUser = get(userStore);
    return {
        props: {
            currentUser: currentUser
        }
    };
}
