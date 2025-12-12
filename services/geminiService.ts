import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ProjectData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.VITE_API_KEY || '' });

let chatSession: Chat | null = null;

/**
 * Initializes or resets the chat session with the current Excel data as context.
 */
export const initializeChatSession = (allProjects: ProjectData[]) => {
  // Convert project data to a minimized string format for the system prompt
  const contextString = JSON.stringify(allProjects.map(p => ({
    project: p.projectName,
    queries: p.rows.map(row => ({
      desc: row.deskripsi,
      type: row.jenisOperasi,
      table: row.namaTabel,
      sql: row.query,
      step: row.step // Renamed from notes
    }))
  })), null, 2);

  const systemInstruction = `
    You are an expert SQL Assistant and Data Engineer.
    You have access to a database of SQL queries organized by "Project" (derived from Excel Sheets).
    
    Here is the Knowledge Base:
    ${contextString}

    Your Goal:
    1. Answer user questions about how to find, update, or select data for specific projects based *strictly* on the Knowledge Base provided.
    2. If a user asks "How do I update Project A?", look for queries in the "Project A" section of the data.
    3. Always provide the SQL Query code in a markdown block.
    4. If the information is missing from the Knowledge Base, politely say you don't have that query on record.
    5. Be concise and helpful. Use the 'step' field to provide extra instruction steps if available.
  `;

  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.2, // Low temperature for factual accuracy based on provided data
    },
  });
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized. Please load data first.");
  }

  try {
    const response: GenerateContentResponse = await chatSession.sendMessage({ message });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};