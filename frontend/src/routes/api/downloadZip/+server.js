import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createGzip } from "zlib";
import { pipeline } from "stream";
import { promisify } from "util";
import JSZip from "jszip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pipelineAsync = promisify(pipeline);

export async function POST({ request }) {
	// Parse formData to get file names
	const formData = await request.formData();
	const fileNames = formData.getAll("files[]");

	// Create a zip file
	const zip = new JSZip();
	const staticPath = path.join(__dirname, "..", "..", "..", "..", "static", "chatAttachments");

	for (const fileName of fileNames) {
		const filePath = path.join(staticPath, fileName);
		if (fs.existsSync(filePath)) {
			const fileContent = fs.readFileSync(filePath);
			zip.file(fileName, fileContent);
		}
	}

	// Generate the zip file
	const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

	// Send response
	return new Response(zipBuffer, {
		status: 200,
		headers: {
			"Content-Type": "application/zip",
			"Content-Disposition": `attachment; filename="download.zip"`
		}
	});
}
