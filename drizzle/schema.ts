import { sql } from "drizzle-orm";
import {
  mysqlTable,
  serial,
  text,
  timestamp,
  int,
  boolean,
  varchar,
  date,
  json,
} from "drizzle-orm/mysql-core";

// Users table for authentication
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).unique().notNull(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  profilePhoto: text("profile_photo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// Family members table - core entity for family tree
export const familyMembers = mysqlTable("family_members", {
  id: serial("id").primaryKey(),
  userId: int("user_id").references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  nickname: text("nickname"),
  gender: varchar("gender", { length: 20 }),
  dateOfBirth: date("date_of_birth"),
  dateOfDeath: date("date_of_death"),
  profilePhoto: text("profile_photo"),
  bio: text("bio"),
  location: text("location"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  socialMedia: json("social_media"), // {facebook, instagram, twitter, etc}
  generation: int("generation").default(1),
  isBornIntoFamily: boolean("is_born_into_family").default(true),
  isAlive: boolean("is_alive").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relationships table - parent-child, spouse, sibling connections
export const relationships = mysqlTable("relationships", {
  id: serial("id").primaryKey(),
  memberId: int("member_id").references(() => familyMembers.id, { onDelete: "cascade" }).notNull(),
  relatedMemberId: int("related_member_id").references(() => familyMembers.id, { onDelete: "cascade" }).notNull(),
  relationshipType: varchar("relationship_type", { length: 50 }).notNull(), // parent, child, spouse, sibling
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Marriages table - track marriage history
export const marriages = mysqlTable("marriages", {
  id: serial("id").primaryKey(),
  spouse1Id: int("spouse1_id").references(() => familyMembers.id, { onDelete: "cascade" }).notNull(),
  spouse2Id: int("spouse2_id").references(() => familyMembers.id, { onDelete: "cascade" }).notNull(),
  marriageDate: date("marriage_date"),
  divorceDate: date("divorce_date"),
  status: varchar("status", { length: 20 }).default("married"), // married, divorced, separated, widowed
  hideExSpouse: boolean("hide_ex_spouse").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Events table - family calendar
export const events = mysqlTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  eventType: varchar("event_type", { length: 50 }).notNull(), // birthday, anniversary, gathering, holiday
  eventDate: timestamp("event_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  createdById: int("created_by_id").references(() => users.id),
  coverPhoto: text("cover_photo"),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: text("recurring_pattern"), // yearly, monthly, etc
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Event attendees - RSVP tracking
export const eventAttendees = mysqlTable("event_attendees", {
  id: serial("id").primaryKey(),
  eventId: int("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  memberId: int("member_id").references(() => familyMembers.id, { onDelete: "cascade" }).notNull(),
  rsvpStatus: varchar("rsvp_status", { length: 20 }).default("pending"), // pending, attending, declined
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Photo albums
export const albums = mysqlTable("albums", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  coverPhoto: text("cover_photo"),
  createdById: int("created_by_id").references(() => users.id),
  eventId: int("event_id").references(() => events.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Photos
export const photos = mysqlTable("photos", {
  id: serial("id").primaryKey(),
  albumId: int("album_id").references(() => albums.id, { onDelete: "cascade" }).notNull(),
  photoUrl: text("photo_url").notNull(),
  caption: text("caption"),
  uploadedById: int("uploaded_by_id").references(() => users.id),
  takenDate: timestamp("taken_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Photo tags - tag family members in photos
export const photoTags = mysqlTable("photo_tags", {
  id: serial("id").primaryKey(),
  photoId: int("photo_id").references(() => photos.id, { onDelete: "cascade" }).notNull(),
  memberId: int("member_id").references(() => familyMembers.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Photo comments
export const photoComments = mysqlTable("photo_comments", {
  id: serial("id").primaryKey(),
  photoId: int("photo_id").references(() => photos.id, { onDelete: "cascade" }).notNull(),
  userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Photo reactions
export const photoReactions = mysqlTable("photo_reactions", {
  id: serial("id").primaryKey(),
  photoId: int("photo_id").references(() => photos.id, { onDelete: "cascade" }).notNull(),
  userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  reactionType: varchar("reaction_type", { length: 20 }).notNull(), // like, love, laugh, etc
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chat conversations
export const conversations = mysqlTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title"), // for group chats
  isGroupChat: boolean("is_group_chat").default(false),
  createdById: int("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Conversation participants
export const conversationParticipants = mysqlTable("conversation_participants", {
  id: serial("id").primaryKey(),
  conversationId: int("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
  userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  lastReadAt: timestamp("last_read_at"),
});

// Chat messages
export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: int("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
  senderId: int("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  messageText: text("message_text"),
  messageType: varchar("message_type", { length: 20 }).default("text"), // text, image, video, audio
  mediaUrl: text("media_url"),
  replyToId: int("reply_to_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Message reactions
export const messageReactions = mysqlTable("message_reactions", {
  id: serial("id").primaryKey(),
  messageId: int("message_id").references(() => messages.id, { onDelete: "cascade" }).notNull(),
  userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  reactionType: varchar("reaction_type", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity feed - family updates
export const activities = mysqlTable("activities", {
  id: serial("id").primaryKey(),
  userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  activityType: varchar("activity_type", { length: 50 }).notNull(), // post, photo_upload, event_created, member_added, etc
  activityText: text("activity_text"),
  relatedEntityType: varchar("related_entity_type", { length: 50 }),
  relatedEntityId: int("related_entity_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity comments
export const activityComments = mysqlTable("activity_comments", {
  id: serial("id").primaryKey(),
  activityId: int("activity_id").references(() => activities.id, { onDelete: "cascade" }).notNull(),
  userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity likes
export const activityLikes = mysqlTable("activity_likes", {
  id: serial("id").primaryKey(),
  activityId: int("activity_id").references(() => activities.id, { onDelete: "cascade" }).notNull(),
  userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notifications
export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  notificationType: varchar("notification_type", { length: 50 }).notNull(),
  notificationText: text("notification_text").notNull(),
  relatedEntityType: varchar("related_entity_type", { length: 50 }),
  relatedEntityId: int("related_entity_id"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Export types for compatibility
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
