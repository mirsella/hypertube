import { getServerSession, getToken } from "#auth";
import fs from "fs";
import type { IncomingMessage, ServerResponse } from "http";
import multer from "multer";
import path from "path";
import { fileTypeFromBuffer } from "file-type";

const uploadDir = path.join(process.cwd(), "uploads/profile_pictures");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_, __, cb) {
    cb(null, uploadDir);
  },
  filename: function (_, file, cb) {
    const uniqueSuffix = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

async function validateAndRenameFile(filePath: string): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath);
  const fileType = await fileTypeFromBuffer(fileBuffer);

  if (!fileType || !["image/png", "image/jpeg"].includes(fileType.mime)) {
    fs.unlinkSync(filePath);
    throw createError({
      statusCode: 422,
      message: "Invalid file type detected",
    });
  }

  const extension = fileType.mime === "image/png" ? ".png" : ".jpg";
  const finalFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${extension}`;
  const finalPath = path.join(uploadDir, finalFilename);

  fs.renameSync(filePath, finalPath);
  return finalFilename;
}

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

    const finalFilename = await validateAndRenameFile(req.file.path);

    const { email } = token;
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

    await db
      .update(tables.users)
      .set({ profile_picture: finalFilename })
      .where(eq(tables.users.email, email));

    return {
      file_path: finalFilename,
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
