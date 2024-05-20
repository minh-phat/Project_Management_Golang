import { writeFile } from "node:fs/promises";
import { extname } from "path";

export async function POST({ request }) {
	const data = await request.formData();
	const file = data.get("file");
	const folderPath = data.get("folderPath");
	const generateFilePath = data.get("generateFilePath");
	var modifyPath = "";
	if (generateFilePath === "false") {
		modifyPath = data.get("modifyPath");
	}
	var filePath = "";

	if (file && file?.name !== undefined && file?.name !== null && file?.name !== "") {
		if (generateFilePath === "true") {
			filePath = `${crypto.randomUUID()}${extname(file?.name)}`;
		} else {
			filePath = modifyPath;
		}
		
		const uploadPath = `./static${folderPath}/${filePath}`;
		try {
			await writeFile(uploadPath, Buffer.from(await file?.arrayBuffer()));
		} catch (error) {
			return new Response(
				JSON.stringify({
					success: false,
					message: "Something went wrong. Please try again later."
				}),
				{
					status: 500,
					headers: {
						"Content-Type": "application/json"
					}
				}
			);
		}
	}

	return new Response(
		JSON.stringify({
			success: true,
			message: "File upload succeeded.",
			filePath: filePath
		}),
		{
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		}
	);
}
