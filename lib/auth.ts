import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // تأكد من أن مسار الـ db صحيح حسب مشروعك
import * as schema from "@/db/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    // هذا الخيار مهم لربط الحقول المخصصة مثل bio
    user: {
        additionalFields: {
            bio: {
                type: "string",
                required: false,
            },
        },
    },
});