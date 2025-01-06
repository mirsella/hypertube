import fs from 'node:fs/promises';
import path from 'path';
import type { H3Event } from 'h3';
import { getToken, getServerSession } from "#auth";

export default defineEventHandler(async (event: H3Event) => {
  const imageName = getRouterParam(event, 'imageName');
  const session = await getServerSession(event);
  const token = await getToken({ event });
  if (!token || !token.email) {
    return { message: "Unauthorized", status: 401 };
  }

  if (!session) {
    return { message: "User is not authenticated", status: 400 };
  }
  if (!imageName) {
    throw createError({ statusCode: 400, message: 'Filename is required' });
  }
  const imagePath = path.join(process.cwd(), 'uploads/profile_pictures', imageName);

  try {
    // Check if the file exists
    await fs.access(imagePath);

    // Set the correct content type
    const ext = path.extname(imageName).toLowerCase();
    let contentType = 'image/jpeg'; // Default
    if (ext === '.png') contentType = 'image/png';
    setHeader(event, 'Content-Type', contentType);

    return await fs.readFile(imagePath);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw createError({ statusCode: 404, message: 'Image not found' });
    }
    console.error("Error serving image:", error);
    throw createError({ statusCode: 400, message: 'Internal server error' });
  }
});