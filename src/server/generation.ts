"use server"

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "./db";
import { sessions } from "./db/schema";
import { desc, eq } from "drizzle-orm";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY??"");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generate_topics_array(topics_plaintext: string): Promise<string[]> {
    const prompt = `'${topics_plaintext}' - CONVERT THIS PLAINTEXT OF TOPICS INTO A JSON ARRAY OF TOPIC HEADERS, IF NOT STATED OTHERWISE ASSUME GCSE LEVEL CONTENT, IF ITEMS IN THE STRING ARE NOT A TOPIC, EITHER SKIP THEM OR GENERALISE A TOPIC TITLE, EXAMPLE OUTPUT: ["Biology", "Endocrine System", "Polynomial Long Division"], ONLY RESPOND WITH THE JSON NO FORMATTING NO RESPONSES TO THE USERS INPUT ONLY THE JSON`;
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    try {
        console.log(response);
        const topics_array = JSON.parse(response/*.replace(/'/g, '"')*/.replaceAll("```json", "").replaceAll("```JSON", "").replaceAll("```", "")) as string[]; 
        return topics_array
    }
    catch (error) {
        console.error("Error parsing JSON response (generate_topics_array):", error);
        return [];
    }
}

async function generate_session_title(topics_array: string[]): Promise<string> {
    const prompt = `'${JSON.stringify(topics_array)}' - Create a short (max 10 words) title for this list of topics, this title should give a general idea of the topics present withought just listing them, the title should be specific and unique to the topics. REPLY WITH ONLY THE TITLE, DO NOT INCLUDE EXTRA TEXT OR OTHER RESPONSES!`;
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return response
}

function generate_random_string(length = 20) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';
    let randomString = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        randomString += charset[randomIndex];
    }

    return randomString;
}

export async function create_session(topics_plaintext: string) {
    const topics_array = await generate_topics_array(topics_plaintext);
    const session_title = await generate_session_title(topics_array);
    const session_id = generate_random_string();

    await db.insert(sessions).values({
        session_title: session_title,
        session_topics: topics_array,
        session_id: session_id
    })
    return session_id;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generate_question_data(session_id: string, question_type: string, previous_questions?: string[]): Promise<any> {
    const topics_array = (await db.select().from(sessions).where(eq(sessions.session_id, session_id)))[0]?.session_topics as string[] ?? [];
    if (topics_array.length > 0) {
        const random_topic = topics_array[Math.floor(Math.random() * topics_array.length)]
        let prompt;

        if (question_type == "flashcards") {
            prompt = `CREATE ONE FLASHCARD QUESTION DATA FOR THIS TOPIC "${random_topic}" IN THE JSON FORMAT: {front: string, back: string}. DO NOT INCLUDE FORMATTING ONLY INCLUDE JSON!`;
        }
        else if (question_type == "multiple-choice questions") {
            prompt = `CREATE ONE MULTI-CHOICE QUESTION DATA FOR THIS TOPIC "${random_topic}" IN THE JSON FORMAT: {question: string, options: string[], answers: string[]} EVEN IF ONLY ONE CORRECT ANSWER PUT IT IN AN []. DO NOT INCLUDE FORMATTING ONLY INCLUDE JSON!`;
        }
        else {
            prompt = `CREATE ONE QUESTION DATA FOR THIS TOPIC "${random_topic}" IN THE JSON FORMAT: {question: string}. DO NOT INCLUDE FORMATTING ONLY INCLUDE JSON!`;
        }

        if (previous_questions) {
            prompt += `\n\n DO NOT INCLUDE ANY OF THESE QUESTIONS: ${previous_questions.join(", ")}`;
        }

        if (prompt) {
            console.log(prompt)
            const result = await model.generateContent(prompt);
            const response = result.response.text();
            try {
                return JSON.parse(response/*.replace(/'/g, '"')*/.replaceAll("```json", "").replaceAll("```JSON", "").replaceAll("```", ""));
            }
            catch (error) {
                console.error("Error parsing JSON response (generate_question_data):", error);
                return null;
            }
        }
    
        return null
    }
    return null
}

export async function check_answer(question: string, answer: string): Promise<string> {
    const prompt = `QUESTION: ${question}. \n\n GIVEN ANSWER: ${answer} \n\n RESPOND DIRECTLY TO THE USER, GIVE FEEDBACK ON THEIR RESPONSE, FORMAT THE OUTPUT IN MARKDOWN`
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return response
}
export async function explain_question(question: string): Promise<string> {
    const prompt = `QUESTION: ${question}. \n\n GIVE A MODEL ANSWER WITH EXPLANATIONS AND CONTEXT, FORMAT THE OUTPUT IN MARKDOWN`
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return response
}

export async function get_recent_sessions(): Promise<{session_title: string, session_id: string}[]> {
    const recent_sessions = await db.select().from(sessions).orderBy(desc(sessions.updatedAt)).limit(10);
    return recent_sessions.map((session) => ({
        session_id: session.session_id??"",
        session_title: session.session_title??"",
    }));
}