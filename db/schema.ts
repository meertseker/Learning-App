import { bigint, index, integer, pgTable, text, timestamp, boolean, bigserial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Courses Table
export const courses = pgTable("courses", {
    courseId: bigserial("course_id", { mode: "number" }).primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    imageSrc: text("image_src").notNull(),
    totalLessons: integer("total_lessons").notNull().default(0),
    isActive: boolean("is_active").notNull().default(false),
    createdAt: timestamp("created_at", { mode: 'string' }).notNull().defaultNow(),
});

// UserProgress Table
export const userProgress = pgTable("user_progress", {
    id: bigint("id", { mode: "number" }).primaryKey(),
    userId: text("user_id").notNull(),
    courseId: bigint("course_id", { mode: "number" }).references(() => courses.courseId),
    completedLessons: integer("completed_lessons").notNull().default(0),
    hearts: integer("hearts").notNull().default(5),
    points: integer("points").notNull().default(0),
    hasActiveSubscription: boolean("has_active_subscription").notNull().default(false),
    updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, table => ({
    userIdIdx: index("user_id_idx").on(table.userId),
}));

// Units Table
export const units = pgTable("units", {
    unitId: bigserial("unit_id", { mode: "number" }).primaryKey(),
    courseId: bigint("course_id", { mode: "number" }).references(() => courses.courseId),
    title: text("title").notNull(),
    description: text("description"),
    order: integer("order").notNull(),
    createdAt: timestamp("created_at", { mode: 'string' }).notNull().defaultNow(),
});

// Lessons Table
export const lessons = pgTable("lessons", {
    lessonId: bigserial("lesson_id", { mode: "number" }).primaryKey(),
    unitId: bigint("unit_id", { mode: "number" }).references(() => units.unitId),
    title: text("title").notNull(),
    description: text("description"),
    order: integer("order").notNull(),
    createdAt: timestamp("created_at", { mode: 'string' }).notNull().defaultNow(),
});

// Questions Table
export const questions = pgTable("questions", {
    questionId: bigserial("question_id", { mode: "number" }).primaryKey(),
    lessonId: bigint("lesson_id", { mode: "number" }).references(() => lessons.lessonId),
    text: text("text").notNull(),
    answers: text("answers").array().notNull(),
    correctAnswer: integer("correct_answer").notNull(),
    explanation: text("explanation"),
    order: integer("order").notNull(),
    type: text("type").notNull().default('multiple-choice'),
    createdAt: timestamp("created_at", { mode: 'string' }).notNull().defaultNow(),
});

// QuestionProgress Table
export const questionProgress = pgTable("question_progress", {
    progressId: bigserial("progress_id", { mode: "number" }).primaryKey(),
    userId: text("user_id").notNull(),
    questionId: bigint("question_id", { mode: "number" }).references(() => questions.questionId),
    attempts: integer("attempts").notNull().default(0),
    isCompleted: boolean("is_completed").notNull().default(false),
    lastAttemptedAt: timestamp("last_attempted_at", { mode: 'string' }).defaultNow(),
});

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

export const unitsRelations = relations(units, ({ one, many }) => ({
    course: one(courses, {
        fields: [units.courseId],
        references: [courses.courseId],
    }),
    lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
    unit: one(units, {
        fields: [lessons.unitId],
        references: [units.unitId],
    }),
    questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
    lesson: one(lessons, {
        fields: [questions.lessonId],
        references: [lessons.lessonId],
    }),
    questionProgress: many(questionProgress),
}));

export const questionProgressRelations = relations(questionProgress, ({ one }) => ({
    question: one(questions, {
        fields: [questionProgress.questionId],
        references: [questions.questionId],
    }),
}));
