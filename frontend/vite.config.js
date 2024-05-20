import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

import { Server } from "socket.io";

const webSocketServer = {
	name: "webSocketServer",
	configureServer(server) {
		if (!server.httpServer) return;

		const io = new Server(server.httpServer);

		io.on("connection", (socket) => {
			var roomId;

			socket.on("init", (room) => {
				roomId = room;
				socket.join(roomId);
			});

			// Receive incoming messages and broadcast them
			socket.on("message", (message) => {
				io.to(roomId).emit("message", message);
			});
		});
	}
};

export default defineConfig({
	plugins: [sveltekit(), webSocketServer],
	server: {
		fs: {
			allow: ["./static"]
		}
	}
});
