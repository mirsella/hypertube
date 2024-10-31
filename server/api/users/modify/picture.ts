import { getServerSession } from "#auth";
import fs from "fs";
import multer from "multer";
import type { IncomingMessage, ServerResponse } from "http";
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "public/images");
	},
	filename: function (req, file, cb) {
		cb(null, `${file.fieldname}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
	},
});

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024,
		fieldSize: 25 * 1024 * 1024,
		files: 5, //
	},
});

export default defineEventHandler(async event => {
	const req = event.req as IncomingMessage & { file?: Express.Multer.File; body?: any };
	const res = event.res as ServerResponse;
	const session = await getServerSession(event);

	if (!session) {
		return { message: "User is not authentificated", status: 400 };
	}
	try {
		// console.log("req.file.filename", req.file?.filename);
		await new Promise<void>((resolve, reject) => {
			// @ts-ignore
			upload.single("file")(req, res, (err: any) => {
				if (err) {
					console.error("Erreur Multer:", err);
					reject({ message: "Error while uploading file", status: 400 });
					return;
				}
				resolve();
			});
		});
		if (!req.file) throw { message: "No file uploaded", status: 400 };

		const file_path = `images/${req.file.filename}`;
		const file = req.file;
		const email = req.body?.email;

		if (!file || !email) {
			throw { message: "Missing required fields", status: 400 };
		}
		const user = await db.select().from(tables.users).where(eq(tables.users.email, email)).get();
		if (fs.existsSync(`public/${user?.profile_picture}`)) {
			fs.unlinkSync(`public/${user?.profile_picture}`);
		}

		await db
			.update(tables.users)
			.set({ profile_picture: file_path } as any)
			.where(eq(tables.users.email, email));

		// console.log("Fichier reçu:", file);
		// console.log("Email reçu:", email);

		return {
			file_path: file_path,
			message: "Profile picture updated successfully",
			status: 200,
		};
	} catch (error) {
		console.error("Error during file upload:", error);
		return error;
	}
});
