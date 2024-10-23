export default defineEventHandler(async (event): Promise<Comment[]> => {
  return db.select().from(tables.comments);
});
