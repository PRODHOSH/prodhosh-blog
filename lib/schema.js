import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").default(""),
  content: text("content").notNull().default(""),
  tags: text("tags").array(),
  published: boolean("published").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  coverImage: text("cover_image").default(""),
  seoTitle: text("seo_title").default(""),
  seoDescription: text("seo_description").default(""),
  // When set, the post goes live at this moment (scheduling) and is used as the display date.
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Uploaded images live in Postgres (base64) so the blog needs no extra storage account.
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt").default(""),
  data: text("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
