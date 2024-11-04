import { config } from 'dotenv';
import path from 'path';

// Ensure environment variables are loaded first
config({
  path: path.join(process.cwd(), '.env'),
  override: true
});

// Add debugging
console.log('Environment Check:');
console.log('- Current Directory:', process.cwd());
console.log('- ENV File Path:', path.join(process.cwd(), '.env'));
console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);

// Only import database after environment is configured
import db from "@/db/drizzle";
import * as schema from "@/db/schema";

const main = async () => { 
    try {
        console.log("Seeding database...");

        // Create Unit 1
        const unit1 = await db.insert(schema.units).values({
            courseId: 1,
            title: "Introduction to AI",
            description: "Basic concepts and fundamentals of AI",
            order: 1,
        }).returning();

        // Create Unit 2
        const unit2 = await db.insert(schema.units).values({
            courseId: 1,
            title: "Machine Learning Basics",
            description: "Understanding machine learning fundamentals",
            order: 2,
        }).returning();

        // Create Lessons for Unit 1
        const lesson1 = await db.insert(schema.lessons).values({
            unitId: unit1[0].unitId,
            title: "What is AI?",
            description: "Introduction to Artificial Intelligence",
            order: 1,
        }).returning();

        const lesson2 = await db.insert(schema.lessons).values({
            unitId: unit1[0].unitId,
            title: "History of AI",
            description: "Evolution of Artificial Intelligence",
            order: 2,
        }).returning();

        // Create Questions for Lesson 1
        await db.insert(schema.questions).values([
            {
                lessonId: lesson1[0].lessonId,
                text: "What is the main goal of Artificial Intelligence?",
                answers: ["To replace humans", "To simulate human intelligence", "To create robots", "To process data"],
                correctAnswer: 1,
                explanation: "AI aims to simulate human intelligence in machines",
                order: 1,
                type: "multiple-choice"
            },
            {
                lessonId: lesson1[0].lessonId,
                text: "Which of these is NOT a branch of AI?",
                answers: ["Machine Learning", "Deep Learning", "Social Media", "Natural Language Processing"],
                correctAnswer: 2,
                explanation: "Social Media is not a branch of AI",
                order: 2,
                type: "multiple-choice"
            }
        ]);

        // Create Questions for Lesson 2
        await db.insert(schema.questions).values([
            {
                lessonId: lesson2[0].lessonId,
                text: "When was the term 'Artificial Intelligence' first coined?",
                answers: ["1956", "1945", "1970", "1960"],
                correctAnswer: 0,
                explanation: "The term was first coined by John McCarthy in 1956",
                order: 1,
                type: "multiple-choice"
            },
            {
                lessonId: lesson2[0].lessonId,
                text: "Who is considered the father of AI?",
                answers: ["Alan Turing", "John McCarthy", "Marvin Minsky", "Herbert Simon"],
                correctAnswer: 0,
                explanation: "Alan Turing is widely considered the father of AI",
                order: 2,
                type: "multiple-choice"
            }
        ]);

        console.log("Seeding completed successfully!");

    } catch (error) {
        console.error("Error seeding database:", error);
        throw error;
    }
};

main();