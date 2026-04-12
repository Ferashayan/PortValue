import { pgTable, text, timestamp, boolean, integer, primaryKey } from "drizzle-orm/pg-core";

// --- 1. جداول التوثيق (Better-Auth) ---
// تم دمج حقل الـ bio داخل جدول المستخدم

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("emailVerified").notNull(),
    image: text("image"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
    // حقل مخصص لمشروعك لتخزين النبذة الشخصية
    bio: text("bio"), 
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" })
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull()
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt"),
    updatedAt: timestamp("updatedAt")
});

// --- 2. جداول النظام (Application Data) ---

// جدول المهارات العامة
export const skills = pgTable("skills", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(), 
  name: text("name").notNull().unique(), // مثل: React, Python, FastAPI
  category: text("category"), // تصنيف: Technical, Soft Skill
});

// جدول الربط بين المستخدم والمهارات (علاقة متعدد إلى متعدد)
export const userSkills = pgTable("user_skills", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  skillId: integer("skillId").notNull().references(() => skills.id, { onDelete: "cascade" }),
  level: text("level"), // مستوى المهارة: Junior, Mid, Senior, Expert
});

// جدول مشاريع المستخدم (علاقة واحد إلى متعدد)
export const projects = pgTable("projects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  link: text("link"), // رابط المشروع على GitHub أو رابط حي
  techStack: text("tech_stack"), // التقنيات المستخدمة في المشروع
});