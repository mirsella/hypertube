import { getServerSession, getToken } from "#auth";
import fs from "fs";
import type { IncomingMessage, ServerResponse } from "http";
import multer from "multer";
import path from "path";
// Définir le chemin de stockage directement dans le projet
const uploadDir = path.join(process.cwd(), "uploads/profile_pictures");

// S'assurer que le dossier existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

console.log("Upload directory:", uploadDir);

const storage = multer.diskStorage({
  destination: function (_, __, cb) {
    cb(null, uploadDir);
  },
  filename: function (_, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new Error("Invalid file type. Only JPEG and PNG files are allowed."));
      return;
    }
    cb(null, true);
  },
});

export default defineEventHandler(async (event) => {
  try {
    const session = await getServerSession(event);
    const token = await getToken({ event });

    if (!session || !token?.email) {
      throw createError({
        statusCode: 401,
        message: "Authentication required",
      });
    }

    const req = event.node.req as IncomingMessage & {
      file?: Express.Multer.File;
      body?: any;
    };
    const res = event.node.res as ServerResponse;

    await new Promise<void>((resolve, reject) => {
      //@ts-ignore
      upload.single("file")(req, res, (err) => {
        if (err) {
          console.error("Upload error:", err);
          reject(
            createError({
              statusCode: 400,
              message: err.message || "Error while uploading file",
            }),
          );
          return;
        }
        resolve();
      });
    });

    if (!req.file) {
      throw createError({
        statusCode: 400,
        message: "No file uploaded",
      });
    }

    const email = req.body?.email;
    if (!email) {
      throw createError({
        statusCode: 400,
        message: "Email is required",
      });
    }

    const user = await db
      .select()
      .from(tables.users)
      .where(eq(tables.users.email, email))
      .limit(1)
      .then((res) => res[0]);

    if (user?.profile_picture) {
      const oldFilePath = path.join(process.cwd(), user.profile_picture);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    const relativePath = path.join(
      "uploads/profile_pictures",
      req.file.filename,
    );

    await db
      .update(tables.users)
      .set({ profile_picture: relativePath })
      .where(eq(tables.users.email, email));

    return {
      file_path: relativePath,
      message: "Profile picture updated successfully",
      status: 200,
    };
  } catch (error: any) {
    console.error("Error during file upload:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Internal server error",
    });
  }
});
