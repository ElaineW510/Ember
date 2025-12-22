import { GoogleGenAI, Type } from "@google/genai";
import { JournalEntry } from "../types";

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A short, poetic, or summarizing title for this journal entry.",
    },
    journalContent: {
      type: Type.STRING,
      description: "A first-person reflective journal entry (300-500 words). It should use 'I' statements, sound authentic to the user, capture emotional nuances, and synthesize the therapist's input into personal realizations.",
    },
    insights: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-5 bullet points identifying key breakthroughs, patterns, or action items.",
    },
    moodTags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 single-word adjectives describing the emotional state.",
    },
    transcript: {
        type: Type.STRING,
        description: "If provided in input, echo it back here. If audio, attempt to transcribe a short summary."
    }
  },
  required: ["title", "journalContent", "insights", "moodTags"],
};

const SYSTEM_INSTRUCTION = `
  You are Ember, an empathetic AI companion.
  Your goal is to listen to a therapy session recording (or read a transcript) and write a personal journal entry FROM THE PERSPECTIVE OF THE PATIENT/CLIENT.
  
  Guidelines:
  - Voice: First-person ("I felt...", "I realized...").
  - Tone: Reflective, vulnerable, honest, and constructive.
  - Content: Don't just transcribe. Synthesize. Mention what the therapist helped "me" see. Focus on "aha" moments.
  - Avoid: Robotic phrasing like "In this session we discussed." Instead use "Today we talked about..." or "I finally opened up about..."
  - Length: 300-500 words.
`;

export const processAudioJournal = async (file: File): Promise<JournalEntry> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const audioPart = await fileToGenerativePart(file);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: {
        parts: [audioPart, { text: "Please listen to this therapy session and generate my reflection journal." }],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response generated");

    const data = JSON.parse(text);

    return {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      title: data.title,
      content: data.journalContent,
      insights: data.insights,
      moodTags: data.moodTags,
      duration: "Session", 
      transcript: data.transcript // Might be empty for audio if not explicitly requested to transcribe full text
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process audio. Please try again.");
  }
};

export const processTextJournal = async (transcript: string): Promise<JournalEntry> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: {
        parts: [{ text: `Here is a transcript of my therapy session:\n\n${transcript}\n\nPlease generate my reflection journal based on this.` }],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response generated");

    const data = JSON.parse(text);

    return {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      title: data.title,
      content: data.journalContent,
      insights: data.insights,
      moodTags: data.moodTags,
      duration: "10 mins", 
      transcript: transcript // We preserve the original transcript for the UI
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process transcript. Please try again.");
  }
};
