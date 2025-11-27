import { GoogleGenAI } from "@google/genai";
import { BehaviorRecord, EmotionRecord } from "../types";

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStudentInsight = async (
  studentName: string,
  behaviors: BehaviorRecord[],
  recentEmotions: EmotionRecord[]
): Promise<string> => {
  try {
    const behaviorSummary = behaviors.map(b => 
      `- ${b.date}: [${b.type === 'good' ? 'Positive' : 'Negative'}] ${b.details} (${b.starChange > 0 ? '+' : ''}${b.starChange} stars)`
    ).join('\n');

    const emotionSummary = recentEmotions.map(e => 
      `- ${e.date}: ${e.emoji} ${e.emotion} ("${e.note}")`
    ).join('\n');

    const prompt = `
      You are an educational psychologist and advisor. Analyze the following data for student "${studentName}".
      
      Behavior Logs (Last 30 days):
      ${behaviorSummary || "No behavior records found."}

      Self-Reported Mood Logs (Last 30 days - Note: Moods might be self-reported by the student anonymously or personally):
      ${emotionSummary || "No mood records found."}

      Please provide a concise, encouraging, and actionable report in Thai language (ภาษาไทย).
      1. Summarize their overall behavior trend.
      2. Analyze their emotional well-being based on the logs.
      3. Suggest 2-3 specific ways a teacher or parent can support this student.
      
      Keep the tone professional yet warm and supportive.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "ไม่สามารถวิเคราะห์ข้อมูลได้ในขณะนี้";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI (โปรดตรวจสอบ API Key)";
  }
};