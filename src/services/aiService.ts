import OpenAI from "openai";
import { AiActionType, AiResponse } from '../types';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const endpoint = import.meta.env.VITE_OPENAI_ENDPOINT;
const deploymentName = import.meta.env.VITE_OPENAI_DEPLOYMENT;

let client: OpenAI | null = null;

if (apiKey && endpoint) {
  client = new OpenAI({
    baseURL: endpoint,
    apiKey: apiKey,
    defaultHeaders: {
      'api-key': apiKey,
    },
    dangerouslyAllowBrowser: true
  });
}

export const isAiAvailable = (): boolean => !!client;

export const generateText = async (
  currentText: string,
  action: AiActionType,
  context?: string
): Promise<AiResponse> => {
  if (!client) return { error: "AI service not initialized" };

  let prompt = "";
  
  switch (action) {
    case AiActionType.REWRITE:
      prompt = `Rewrite the following text to be more engaging and clear, maintaining the original meaning: "${currentText}"`;
      break;
    case AiActionType.TRANSLATE:
      prompt = `Translate the following text to Spanish: "${currentText}"`;
      break;
    case AiActionType.SHORTER:
      prompt = `Shorten the following text while keeping the key information: "${currentText}"`;
      break;
    case AiActionType.LONGER:
      prompt = `Expand on the following text with more descriptive details: "${currentText}"`;
      break;
    case AiActionType.TONE_PROFESSIONAL:
      prompt = `Rewrite the following text to sound professional and corporate: "${currentText}"`;
      break;
    case AiActionType.TONE_CASUAL:
      prompt = `Rewrite the following text to sound casual and friendly: "${currentText}"`;
      break;
    default:
      prompt = `Improve this text: "${currentText}"`;
  }

  if (context) {
    prompt += `\nContext of the element: ${context}`;
  }

  try {
    const completion = await client.chat.completions.create({
      messages: [
        { role: "user", content: prompt }
      ],
      model: deploymentName || "gpt-5.1-codex-max",
    });
    
    const text = completion.choices[0]?.message?.content?.trim();
    return { text: text || "" };
  } catch (e: any) {
    console.error("OpenAI API Error:", e);
    return { error: e.message || "Failed to generate text" };
  }
};

export const generateImage = async (prompt: string): Promise<AiResponse> => {
  if (!client) return { error: "AI service not initialized" };

  try {
    // Note: Azure OpenAI may not support DALL-E image generation
    // This is a placeholder - you may need to use a different service for images
    const completion = await client.chat.completions.create({
      messages: [
        { role: "user", content: `Generate a description for an image: ${prompt}` }
      ],
      model: deploymentName || "gpt-5.1-codex-max",
    });
    
    return { error: "Image generation not supported with this OpenAI deployment. Consider using DALL-E API separately." };

  } catch (e: any) {
    console.error("OpenAI Image Gen Error:", e);
    return { error: e.message || "Failed to generate image" };
  }
};

export const convertHtmlToEmail = async (htmlCode: string): Promise<string> => {
  if (!client) throw new Error("AI service not initialized");

  const prompt = `
    You are an expert email developer. 
    Convert the following HTML code into a production-ready, email-safe HTML template.
    
    Requirements:
    1. Inline all CSS styles (convert classes like Tailwind to inline styles).
    2. Convert layout structures to table-based layouts where necessary for maximum compatibility (Outlook, Gmail).
    3. Remove all <script> tags, React-specific attributes, and external stylesheet links that are not email safe.
    4. Ensure the visual appearance remains as close as possible to the original.
    5. Output ONLY the valid HTML code, without markdown code fencing.

    Source Code:
    ${htmlCode}
  `;

  try {
    const completion = await client.chat.completions.create({
      messages: [
        { role: "developer", content: "You are an expert email developer who converts React/HTML to email-safe HTML." },
        { role: "user", content: prompt }
      ],
      model: deploymentName || "gpt-5.1-codex-max",
    });
    
    let text = completion.choices[0]?.message?.content || "";
    // Strip markdown fencing if the model adds it despite instructions
    text = text.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    return text;
  } catch (e: any) {
    console.error("Conversion Error:", e);
    throw new Error(e.message || "Failed to convert code");
  }
};


export const generateEmailDesign = async (
  prompt: string,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  if (!client) throw new Error("AI service not initialized. Add VITE_OPENAI_API_KEY and VITE_OPENAI_ENDPOINT to .env");

  const systemPrompt = `You are an expert email template designer. Generate beautiful, production-ready HTML email designs.

Rules:
1. Use inline CSS styles only (no <style> blocks, no external stylesheets).
2. Use table-based layouts for email client compatibility (Outlook, Gmail, Apple Mail).
3. Use web-safe fonts (Arial, Helvetica, Georgia, Times New Roman, Verdana).
4. Include proper email structure: DOCTYPE, html, head with meta charset/viewport, body.
5. Use max-width of 600px for the main container, centered with margin: 0 auto.
6. Include placeholder images from https://picsum.photos with appropriate dimensions.
7. Use a clean, modern design with good spacing and visual hierarchy.
8. Make buttons with table-based bulletproof buttons (VML for Outlook not required).
9. Output ONLY the raw HTML code. No markdown fencing, no explanations.`;

  try {
    const completion = await client.chat.completions.create({
      messages: [
        { role: "developer", content: systemPrompt },
        { role: "user", content: `Design an email template for: ${prompt}` }
      ],
      model: deploymentName || "gpt-5.1-codex-max",
      stream: !!onChunk,
    });

    if (onChunk) {
      // Handle streaming response
      let fullText = '';
      const stream = completion as AsyncIterable<any>;
      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content || '';
        if (delta) {
          fullText += delta;
          onChunk(fullText);
        }
      }
      return fullText.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    } else {
      const result = completion as OpenAI.Chat.Completions.ChatCompletion;
      let text = result.choices[0]?.message?.content || "";
      text = text.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
      return text;
    }
  } catch (e: any) {
    console.error("Email Generation Error:", e);
    throw new Error(e.message || "Failed to generate email design");
  }
};
