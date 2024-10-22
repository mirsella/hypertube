export default defineEventHandler(async (event) => {
  return db.select().from(tables.comments);
});
