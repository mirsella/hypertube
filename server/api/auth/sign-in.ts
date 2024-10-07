// * api/auth/sign-in.ts
import bcrypt from "bcrypt";
export default defineEventHandler(async event => {
	const { username, password } = await readBody(event);
	console.log("api/auth/sign-in.ts, has been called ", { username, password });
    if (!username || !password) {
        return new Response("Missing required fields", { status: 400 });
    }
    const user = await db.select().from(tables.users).where(eq(tables.users.username, username)).get();
    if (!user) 
    {
        return new Response("Username not found", { status: 400 });
    }
    
    if (user.password === null)
    {
        return new Response("Invalid password", { status: 400 });
    }
    
    if (user)
    {
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (isPasswordMatch)
        {
            return new Response("Sign in successfully", { status: 200 });
        }
        else
        {
            return new Response("Invalid password", { status: 400 });
        } 
    }
});