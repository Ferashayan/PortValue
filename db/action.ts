// db/actions.ts
"use server"
import { db } from "@/db";
import { projects, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserDashboardData(userId: string) {
  // جلب بيانات المستخدم (مثل الـ Bio الجديد)
  const userData = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  // جلب مشاريع المستخدم
  const userProjects = await db.query.projects.findMany({
    where: eq(projects.userId, userId),
  });

  return { userData, userProjects };
}