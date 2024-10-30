export default defineEventHandler(async (event) => {
  // TODO: check auth
  return await db.select().from(tables.users);
});
