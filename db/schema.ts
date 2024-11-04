import { bigint, index, integer, pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Courses Table
export const courses = pgTable("courses", {
    courseId: bigint("course_id", { mode: "number" }).primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    imageSrc: text("image_src").notNull(),
    totalLessons: integer("total_lessons").notNull().default(0),
    isActive: boolean("is_active").notNull().default(false), // New isActive field
    createdAt: timestamp("created_at", { mode: 'string' }).notNull().defaultNow(),
});

// UserProgress Table
export const userProgress = pgTable(
    "user_progress" as const,
    {
        id: bigint("id", { mode: "number" }).primaryKey(),
        userId: text("user_id").notNull(),
        courseId: bigint("course_id", { mode: "number" }).references(() => courses.courseId),
        completedLessons: integer("completed_lessons").notNull().default(0),
        hearts: integer("hearts").notNull().default(5),
        points: integer("points").notNull().default(0),
        hasActiveSubscription: boolean("has_active_subscription").notNull().default(false),
        updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
    },
    (table) => ({
        userIdIdx: index("user_id_idx").on(table.userId),
    })
);

// Define relations
export const coursesRelations = relations(courses, ({ many }) => ({
    userProgress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
    course: one(courses, {
        fields: [userProgress.courseId],
        references: [courses.courseId],
    }),
}));
