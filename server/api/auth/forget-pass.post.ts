// * api/auth/forget-pass.ts
//@ts-expect-error
import crypto from "crypto";
import nodemailer from "nodemailer";

async function check_credidentials_provider(email: string) {
    if (!email) {
        return false;
    }

    const userWithLocalProvider = await db
        .select()
        .from(tables.providers)
        .where(
            and(eq(tables.providers.email, email), eq(tables.providers.provider, "credentials"))
        );

    // console.log("user With local provider === ", userWithLocalProvider);

    if (userWithLocalProvider.length === 0) {
        console.log("le provider credentials n'existe pas");
        return false;
    } else {
        console.log("le provider credentials existe");
        return true;
    }
}

async function check_mail_exist(email: string) {
    const verif_email = await db.select().from(tables.users).where(eq(tables.users.email, email));
    // console.log("Verif_email === ", verif_email);

    if (verif_email.length === 0) {
        // console.log("le mail existe pas dans la db");
        return false;
    } else {
        true;
    }
    return 0;
}
async function send_mail(email: string, token: string) {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    const link = `http://localhost:3000/reset_password/${token}`;

    const mailOptions = {
        from: process.env.MAIL_USER,
        to: email,
        subject: "Reset password",
        text: "You can reset your password by clicking on this link : " + link,
    };

    transporter.sendMail(mailOptions, function (error: any, info: any) {
        if (error) {
            console.log("Error: ", error);
            return false;
        } else {
            console.log("Email sent: ", info.response);
        }
    });

    return true;
}

async function generate_token(email: string) {
    if (email === undefined) {
        return null;
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    const resetExpirationToken = new Date(Date.now() + 1800000); //

    await db
        .update(tables.users)
        .set({
            resetToken: resetToken,
            resetExpirationToken: resetExpirationToken, // Assign as Date object
        })
        .where(eq(tables.users.email, email));

    if (resetToken === undefined) {
        return null;
    }
    // console.log("Le token generer === ", resetToken);
    return resetToken;
}

export default defineEventHandler(async (event) => {
    const { email } = await readBody(event);
    console.log("Email === ", email);
    if (!email) {
        return new Response("Missing required fields", { status: 400 });
    }
    if ((await check_mail_exist(email)) === false) {
        return new Response("Email doesn't exist", { status: 400 });
    }

    if ((await check_credidentials_provider(email)) === false)
        return new Response("User doesn't have provider credidentials", { status: 400 });
    // send email in the front
    const token = await generate_token(email);
    if (token === null) {
        return new Response("Error while generating the token", { status: 400 });
    }
    // console.log("Token === ", token);
    if ((await send_mail(email, token)) === false) {
        return new Response("Error while sending the mail", { status: 400 });
    }
    return new Response("Email send success", {
        status: 200,
    });
});
