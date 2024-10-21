import fs from 'fs'
export default defineEventHandler(async (event)=> {
  const moviesDir = useRuntimeConfig().moviesDir;
  return fs.readdirSync(moviesDir).map((name) => {
    return {
      id: name,
      title: Buffer.from(name, "base64").toString()
    }
  })
})
