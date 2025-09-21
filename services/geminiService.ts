import { GoogleGenAI, Type } from "@google/genai"; 

interface PlanOptions {
  theme: string;
  detailLevel: string;
  creativity: number;
  brandPersona: string;
  targetAudience: string;
}

export interface ColorInfo {
    hex: string;
    role: string;
    description: string;
}

export interface Palette {
    name: string;
    description: string;
    colors: ColorInfo[];
}

export interface SmartAction {
    label: string;
    prompt: string;
    type: 'text' | 'image';
}

// Ensure API_KEY is available in the environment.
// The user/developer is responsible for ensuring process.env.API_KEY is populated.
const apiKey = process.env.API_KEY;

if (!apiKey && typeof window !== 'undefined') { // Log only in browser-like environments if key might be missing
  console.warn("Gemini API key (process.env.API_KEY) might not be set. Ensure it is configured for the application to function. This warning is for client-side context.");
}

// Initialize AI client.
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

const modelName = "gemini-2.5-flash";

export async function* generateWebPagePlanStream(description: string, options: PlanOptions): AsyncGenerator<string, void, undefined> {
  if (!apiKey) { // Critical runtime check before making an API call
     throw new Error("API Key Error: Gemini API key is not configured. Please ensure the API_KEY environment variable is properly set.");
  }

  const { theme, detailLevel, creativity, brandPersona, targetAudience } = options;

  let themeInstruction = '';
  if (theme && theme !== 'standard') {
      themeInstruction = `
- **Visual Theme:** All visual and layout suggestions MUST strictly adhere to a **${theme}** aesthetic. This should influence color palettes, typography choices, and the style of suggested imagery.`;
  }

  let detailInstruction = '';
  switch (detailLevel) {
      case 'compact':
          detailInstruction = 'Keep the descriptions for each section brief and high-level. Focus on the core elements only.';
          break;
      case 'detailed':
          detailInstruction = 'Provide a highly detailed, comprehensive breakdown. For each section, expand on the content with suggestions for specific copy, micro-interactions, and accessibility considerations (e.g., ARIA roles, landmarks).';
          break;
      default: // 'standard'
          detailInstruction = 'Provide a standard level of detail for each section.';
          break;
  }
  
  let personaInstruction = '';
  switch (brandPersona) {
      case 'playful':
          personaInstruction = `
- **Brand Persona:** The plan's tone, vocabulary, and suggestions must be **Playful and Witty**. Use creative and fun language. Suggest vibrant colors, quirky animations, and a conversational style for the copy.`;
          break;
      case 'formal':
          personaInstruction = `
- **Brand Persona:** The plan's tone, vocabulary, and suggestions must be **Formal and Trustworthy**. Use professional and clear language. Suggest a structured layout, a conservative color palette (e.g., blues, greys), and authoritative copy. Emphasize security and reliability in component suggestions.`;
          break;
      case 'minimalist-elegant':
          personaInstruction = `
- **Brand Persona:** The plan's tone, vocabulary, and suggestions must be **Minimalist and Elegant**. Focus on simplicity, generous whitespace, and high-end typography. Use a monochromatic or muted color palette. The language should be concise and sophisticated.`;
          break;
      case 'bold':
           personaInstruction = `
- **Brand Persona:** The plan's tone, vocabulary, and suggestions must be **Bold and Adventurous**. Use strong, impactful language. Suggest dynamic layouts, vibrant, high-contrast colors, and unconventional design elements. Encourage risk-taking in the design.`;
           break;
      default: // 'default'
           personaInstruction = '';
           break;
  }

  let audienceInstruction = '';
  switch (targetAudience) {
      case 'gen-z':
          audienceInstruction = `
- **Target Audience:** The plan MUST be tailored for **Gen Z Gamers**. Use relevant slang, memes, and cultural references. Suggest dark themes, neon colors, and dynamic, engaging visuals. Prioritize mobile-first design and integration with platforms like Twitch or Discord.`;
          break;
      case 'corporate':
          audienceInstruction = `
- **Target Audience:** The plan MUST be tailored for **Corporate Executives**. The tone should be professional, data-driven, and concise. Suggest clean layouts, a formal color palette, and visualizations like graphs and charts. Emphasize clarity, efficiency, and ROI.`;
          break;
      case 'families':
          audienceInstruction = `
- **Target Audience:** The plan MUST be tailored for **Young Families**. The tone should be warm, friendly, and reassuring. Suggest bright, cheerful colors, clear navigation, and family-friendly imagery. Content should be easy to scan and understand, even when distracted.`;
          break;
      default: // 'general'
           audienceInstruction = '';
           break;
  }

  const detailedPrompt = `
You are an expert UI/UX designer and web architect AI.
A user wants to create a web page and has provided the following description and planning directives.
Your task is to generate a structured, comprehensive, conceptual plan for this web page.

The plan must be easy to read and include the following sections in this exact order:

1.  **Overall Page Structure (ASCII Art):**
    *   Create a simple ASCII art representation of the entire page's vertical flow.
    *   Inside each box, you MUST include the section name and a brief list of its key components. Example: \`| Header: Logo, Navigation, CTA Button |\`.
    *   Wrap the entire ASCII art block in Markdown-style triple backticks (\`\`\`).
    *   Example:
        \`\`\`
        +-------------------------------------------+
        | Header: Logo, Navigation Links, Sign Up   |
        +-------------------------------------------+
        | Hero: Headline, Subheading, [Image], CTA  |
        +-------------------------------------------+
        | Features: [Icon]+Text, [Icon]+Text        |
        +-------------------------------------------+
        | CTA: Compelling Text, Email Input, Button |
        +-------------------------------------------+
        | Footer: Links, Social Media, Copyright    |
        +-------------------------------------------+
        \`\`\`

2.  **Page Title Suggestion:** A catchy and relevant title for the web page.

3.  **Core Purpose:** A brief statement of the page's main goal.

4.  **Design System & Typography:**
    *   Provide foundational design system recommendations for consistency.
    *   **Font Pairing:** Suggest a heading font and a body font (e.g., from Google Fonts), with a rationale.
    *   **Typography Scale:** Suggest font sizes (in rem or px) and weights for H1, H2, H3, and Body text.
    *   **Spacing System:** Recommend a base spacing unit (e.g., 8px) for consistent margins and padding.
    *   **Button Styles:** Define styles (background, text color, border) and states (hover, active, disabled) for a Primary and a Secondary button.

5.  **Key Sections:** A list of essential sections (e.g., Header, Hero, Features, CTA, Footer).
    For each section, provide:
    *   A concise name for the section.
    *   A brief description of its content and purpose.
    *   **Visual & Layout Notes:** Specific suggestions for visuals and layout. When suggesting a visual element (like an image, icon, or illustration), you MUST use bracket notation and provide a highly specific, descriptive suggestion that aligns with the chosen theme. Vague placeholders are strictly forbidden.
        *   **Good Example:** \`[Image: A vibrant, high-resolution photo of diverse people collaborating around a whiteboard]\`
        *   **Good Example:** \`[Icon: A clean, single-line icon of a gear for settings]\`
        *   **Bad Example:** \`[Image]\` or \`[Icon]\`.
    *   **Suggested Color Palette:** A bulleted list of 3-5 suggested colors with HEX codes, a role (e.g., "Primary Background"), and a brief rationale for its use in this section.
    *   **Content Generation Marker**: CRITICAL: You MUST place the marker \`<!-- GENERATE_CONTENT_HERE -->\` on its own line right after the color palette and before the UI components list.
    *   **Suggested UI Components:** This is the most critical and mandatory section of the plan. For each component, you MUST provide a deeply detailed, developer-focused rationale. Your output for this section must be structured with absolute precision.
        *   For each component, start the line with Markdown checkbox syntax: \`- [ ] \`. Follow this with the component's name in **bold** (e.g., \`- [ ] **Card**:\`).
        *   On subsequent, indented lines, provide a rationale that is STRICTLY structured with the following five sub-headings: **Usability**, **Accessibility**, **Performance**, **CSS Styling Considerations**, and **Interactive States**. Each sub-heading MUST contain specific, actionable, and technical advice. Vague suggestions are unacceptable. For non-interactive elements, you may omit the 'Interactive States' section.
        *   Follow this example with absolute precision. The level of detail and structure shown here is the required standard for ALL component suggestions.
            *   - [ ] **Input Field**: For the user to enter their email address.
                *   **Usability:** Use \`type="email"\` to trigger appropriate mobile keyboards. Implement inline validation with clear icons and helper text to guide the user.
                *   **Accessibility:** A semantic \`<label>\` MUST be programmatically associated with the input using \`for\` and \`id\`. Use \`aria-describedby\` to link to error messages. Use \`aria-invalid="true"\` when input is invalid.
                *   **Performance:** Implement client-side validation to avoid unnecessary server requests. For real-time validation, debounce the input event handler to prevent it from firing on every keystroke, which can be computationally expensive.
                *   **CSS Styling Considerations:** Set a consistent height and padding (e.g., \`padding: 0.5rem 0.75rem;\`). Use a base border style like \`border: 1px solid var(--border-color-base);\`. Use \`width: 100%;\` to make it responsive by default within its container.
                *   **Interactive States**:
                    *   **Hover**: Slightly change the border color to indicate interactivity (e.g., \`:hover { border-color: var(--border-color-soft); }\`).
                    *   **Focus**: Provide a clear, visible focus state using \`:focus-visible\`, such as a 2px border or a box-shadow in the accent color: \`border-color: var(--color-accent-ring); box-shadow: 0 0 0 2px var(--color-accent-300);\`.
                    *   **Disabled**: Use a muted background (e.g., \`background-color: var(--color-surface-1);\`) and text color, along with a \`cursor: not-allowed;\` style, to show it's non-interactive.
            *   - [ ] **Button**: For submitting the form.
                *   **Usability:** The button MUST be disabled during form submission to prevent duplicate requests. On success, provide clear feedback (e.g., a success message). The clickable area should be large enough for easy interaction.
                *   **Accessibility:** Use a semantic \`<button type="submit">\` element. The button text must clearly describe its action (e.g., "Create Account"). Use \`aria-live="polite"\` on a status region to announce submission results to screen readers.
                *   **Performance:** Animate states using GPU-accelerated CSS properties like \`transform\` and \`opacity\` instead of properties that trigger layout shifts, like \`margin\` or \`width\`.
                *   **CSS Styling Considerations:** Use padding for a larger click target (e.g., \`padding: 0.75rem 1.5rem;\`). Use CSS variables for colors (e.g., \`background-color: var(--color-primary-600);\`). For responsive design, consider reducing padding and font-size on smaller screens using media queries.
                *   **Interactive States**: Detail the visual feedback for different user interactions.
                    *   **Hover**: The button should slightly darken its background color (e.g., \`:hover { background-color: var(--color-primary-700); }\`) and may lift with a subtle box-shadow increase to indicate interactivity.
                    *   **Focus**: A visible focus ring using \`:focus-visible\` (e.g., \`{ outline: 2px solid var(--color-accent-ring); outline-offset: 2px; }\`) is crucial for keyboard navigation and should not be disabled.
                    *   **Active**: When clicked, the button can be slightly inset using \`:active { transform: scale(0.98); }\` to provide immediate feedback.
                    *   **Disabled**: The button must have a visually distinct style (e.g., reduced opacity \`opacity: 0.6;\`, a muted background color \`background-color: var(--color-surface-4);\`, and the \`cursor: not-allowed;\` style) to indicate it's not interactive.

6.  **SEO & Keyword Strategy:**
    *   Provide actionable SEO recommendations to improve the page's visibility.
    *   **Meta Title Suggestion:** Craft a concise, keyword-rich title (under 60 characters). This should be different from the on-page H1 title.
    *   **Meta Description Suggestion:** Write a compelling description (under 160 characters) that encourages clicks from search engine results pages.
    *   **Header Tag Structure (Semantic SEO):** Briefly explain the importance of a logical header hierarchy (one H1, followed by H2s, then H3s). Provide a structural example based on the 'Key Sections'.
    *   **Keyword Suggestions:** List 5-7 primary and secondary keywords relevant to the page's content and purpose.

7.  **Responsive Design Strategy (Mobile, Tablet, Desktop):**
    *   Describe how the page layout should adapt to different screen sizes.
    *   **Mobile (< 768px):** Describe a single-column layout. How does the navigation change (e.g., collapses into a hamburger menu)? How do grids stack?
    *   **Tablet (768px - 1024px):** Describe an intermediate layout. Does the grid become 2 columns? Is navigation still collapsed or partially visible?
    *   **Desktop (> 1024px):** Describe the full-width layout. Multi-column grids, visible navigation, etc.

8.  **Call to Action (CTA) Idea:** Suggest a a primary call to action for the page.

9.  **Accessibility Compliance Checklist (WCAG 2.1 AA):**
    *   Generate a checklist of key WCAG success criteria relevant to the components and structure of THIS specific page plan.
    *   Use Markdown checkbox syntax (\`- [ ]\`) for each item. This is mandatory.
    *   This checklist is for developers to track their implementation of accessibility best practices.
    *   Include at least 5 relevant criteria covering perception, operability, and understandability.
    *   **Example Checklist Items (tailor these to the generated plan):**
        *   - [ ] 1.1.1 Non-text Content: All non-text content (e.g., images, icons) has a text alternative.
        *   - [ ] 1.4.3 Contrast (Minimum): Text and images of text have a contrast ratio of at least 4.5:1.
        *   - [ ] 2.1.1 Keyboard: All functionality is operable through a keyboard interface.
        *   - [ ] 2.4.6 Headings and Labels: Headings and labels describe topic or purpose.
        *   - [ ] 3.3.2 Labels or Instructions: Labels or instructions are provided when content requires user input.
        *   - [ ] 4.1.2 Name, Role, Value: For all UI components, the name and role can be programmatically determined.

IMPORTANT:
- Output the plan as clear, well-formatted text. Use Markdown-like headings (e.g., ## Section Name) and bullet points (e.g., * Item) for readability.
- DO NOT generate HTML, CSS, or JavaScript code. Only the conceptual plan.
- Keep the tone helpful and professional.

---
User's Web Page Description:
${description}
---
PLANNING DIRECTIVES:
- **Detail Level:** ${detailInstruction}
${themeInstruction}
${personaInstruction}
${audienceInstruction}
---

Begin Plan:
`;

  try {
    const responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents: detailedPrompt,
        config: {
          temperature: creativity,
        }
    });

    for await (const chunk of responseStream) { // chunk is of type GenerateContentResponse
      // Correctly access text directly from chunk.text as per SDK guidelines.
      const text = chunk.text; // Access the 'text' property
      if (typeof text === 'string' && text.length > 0) {
        yield text;
      }
    }

  } catch (error) {
    console.error("Error calling Gemini API stream:", error);
    if (error instanceof Error) {
        if (error.message.toLowerCase().includes("api key") || 
            error.message.toLowerCase().includes("authenticate") ||
            error.message.toLowerCase().includes("authentication") ||
            error.message.toLowerCase().includes("permission denied")) {
             throw new Error(`Gemini API Authentication Error: ${error.message}. Please check your API key configuration and permissions.`);
        }
        throw new Error(`Gemini API request failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
}

export async function* generateSectionContentStream(pagePlan: string, sectionContext: string, instruction: string): AsyncGenerator<string, void, undefined> {
  if (!apiKey) {
    throw new Error("API Key Error: Gemini API key is not configured.");
  }

  const instructionBlock = instruction.trim()
    ? `**USER'S INSTRUCTION FOR THIS SECTION (prioritize this):** ${instruction.trim()}`
    : '';

  const prompt = `
You are an expert creative copywriter AI. Your task is to generate compelling content for a specific section of a web page, based on an overall plan and a user's specific instruction.
The content should be engaging, clear, and perfectly aligned with the section's purpose and the website's overall theme as described in the plan.
Generate content that could include headlines, sub-headlines, body paragraphs, list items, or button text, as appropriate for the section.
Output the content in well-formatted Markdown. Do not repeat the section details, only generate the new content.

---
**OVERALL WEB PAGE PLAN (for context):**
${pagePlan}
---
**GENERATE CONTENT FOR THIS SPECIFIC SECTION:**
${sectionContext}
---
${instructionBlock}
---

Begin Generated Content:
  `;
  
  try {
    const responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents: prompt,
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (typeof text === 'string' && text.length > 0) {
        yield text;
      }
    }
  } catch (error) {
    console.error("Error calling Gemini API for section content:", error);
    if (error instanceof Error) {
        if (error.message.toLowerCase().includes("api key") || 
            error.message.toLowerCase().includes("permission denied")) {
             throw new Error(`Gemini API Authentication Error: ${error.message}.`);
        }
        throw new Error(`Gemini API request failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating section content.");
  }
}

export async function generateVisualMockup(textPlan: string): Promise<string> {
  if (!apiKey) {
    throw new Error("API Key Error: Gemini API key is not configured. Please ensure the API_KEY environment variable is properly set.");
  }

  const summarizationPrompt = `
You are an expert prompt engineer for an AI image generation model.
Based on the following web page plan, create a concise, descriptive prompt (under 200 words) that describes the visual layout and key elements for a UI/UX wireframe.
The prompt should focus on structure, placement of elements (like headers, footers, image boxes, text blocks), and overall style (e.g., minimalist, corporate).
The output MUST be a single paragraph. Describe it as a "clean, modern, grayscale UI/UX wireframe". Represent text with placeholder lines and images with simple boxes containing a cross.
Do not use markdown or any special formatting in your output.

WEB PAGE PLAN:
---
${textPlan}
---

IMAGE GENERATION PROMPT:`;

  let imagePrompt = '';
  try {
    const summaryResponse = await ai.models.generateContent({
        model: modelName,
        contents: summarizationPrompt,
        config: { temperature: 0.1 }
    });
    imagePrompt = summaryResponse.text;

    if (!imagePrompt || imagePrompt.trim() === '') {
        console.warn("Summarization failed, using generic prompt.");
        imagePrompt = "A clean and modern UI/UX wireframe of a standard landing page, including a header, hero section, features section, and footer. Grayscale schematic with placeholder text and image boxes.";
    }
  } catch(error) {
    console.error("Error summarizing plan for image generation, using fallback prompt:", error);
    imagePrompt = "A clean and modern UI/UX wireframe of a standard landing page, including a header, hero section, features section, and footer. Grayscale schematic with placeholder text and image boxes.";
  }
  
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: imagePrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '9:16',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image.imageBytes) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      // @ts-ignore
      const promptFeedback = response.promptFeedback;
      if (promptFeedback?.blockReason) {
        const reason = `Reason: ${promptFeedback.blockReason}.`;
        // @ts-ignore
        const ratings = promptFeedback.safetyRatings?.map(r => `  - ${r.category}: ${r.probability}`).join('\n');
        throw new Error(`Image generation failed because the prompt was blocked by safety filters.\n${reason}\nDetails:\n${ratings || 'No safety ratings provided.'}`);
      }
      throw new Error("Image generation failed: The API returned no image data. This can be due to strict safety filters or a temporary issue with the image model. Please try again or adjust your page description.");
    }
  } catch (error) {
    console.error("Error calling Gemini Image Generation API:", error);
    if (error instanceof Error) {
      if (error.message.toLowerCase().includes("api key") || 
          error.message.toLowerCase().includes("authenticate") ||
          error.message.toLowerCase().includes("permission denied")) {
        throw new Error(`Gemini API Authentication Error: ${error.message}.`);
      }
      throw new Error(`Gemini Image Generation failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the visual mockup.");
  }
}

export async function* generateCodeSnippetStream(pagePlan: string, componentContext: string): AsyncGenerator<string, void, undefined> {
    if (!apiKey) {
        throw new Error("API Key Error: Gemini API key is not configured.");
    }
    const prompt = `
You are an expert frontend developer. Your task is to generate a clean, modern, and self-contained code snippet for a specific UI component based on a web page plan and detailed component requirements.

**Instructions:**
1.  **Technology Stack:** Generate a React component using TypeScript (TSX) and Tailwind CSS for styling.
2.  **Self-Contained:** The component should be a single, copy-pasteable file. Include necessary imports from React. Do not assume any external components or utility functions exist.
3.  **Best Practices:** The code MUST adhere to the **usability**, **accessibility**, **performance**, and **styling** considerations provided in the component description.
4.  **Placeholders:** Use placeholders for props and functions (e.g., \`onClick\`, \`imageUrl\`). Add TypeScript interfaces for props and add comments to explain what they do.
5.  **Output Format:** Output ONLY the code within a single Markdown code block for TSX (\`\`\`tsx ... \`\`\`). Do not add any extra explanations before or after the code block.

---
**OVERALL WEB PAGE PLAN (for context):**
${pagePlan}
---
**GENERATE CODE FOR THIS SPECIFIC COMPONENT:**
${componentContext}
---

Begin Code Snippet:
`;
    try {
        const responseStream = await ai.models.generateContentStream({
            model: modelName,
            contents: prompt,
        });
        for await (const chunk of responseStream) {
            const text = chunk.text;
            if (typeof text === 'string' && text.length > 0) {
                yield text;
            }
        }
    } catch (error) {
        console.error("Error calling Gemini API for code snippet:", error);
        if (error instanceof Error) {
            if (error.message.toLowerCase().includes("api key")) {
                throw new Error(`Gemini API Authentication Error: ${error.message}.`);
            }
            throw new Error(`Gemini API request failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the code snippet.");
    }
}

export async function generateAlternativePalettes(pagePlan: string): Promise<Palette[]> {
    if (!apiKey) {
        throw new Error("API Key Error: Gemini API key is not configured.");
    }

    const prompt = `Based on the provided web page plan, generate 3 distinct and thematic alternative color palettes. The palettes should be suitable for the page's purpose and target audience.

WEB PAGE PLAN:
---
${pagePlan}
---

Please generate the palettes according to the specified JSON schema.`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        palettes: {
                            type: Type.ARRAY,
                            description: "An array of 3 color palettes.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING, description: "e.g., 'Earthy & Organic' or 'Vibrant & Energetic'" },
                                    description: { type: Type.STRING, description: "A brief description of the palette's mood and ideal use case." },
                                    colors: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                hex: { type: Type.STRING, description: "The color's hex code, e.g., '#FFFFFF'." },
                                                role: { type: Type.STRING, description: "The color's role, e.g., 'Primary Background', 'Accent', 'Text', 'Subtle Border'." },
                                                description: { type: Type.STRING, description: "A brief rationale for this color's use." }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result.palettes;

    } catch (error) {
        console.error("Error calling Gemini API for color palettes:", error);
        if (error instanceof Error) {
            if (error.message.toLowerCase().includes("api key")) {
                throw new Error(`Gemini API Authentication Error: ${error.message}.`);
            }
            throw new Error(`Gemini API request failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating color palettes.");
    }
}

export async function generateSmartActions(pagePlan: string): Promise<SmartAction[]> {
    if (!apiKey) {
        throw new Error("API Key Error: Gemini API key is not configured.");
    }
    const prompt = `
You are a smart AI assistant integrated into a web page planning tool.
Analyze the following web page plan and identify up to 3 high-impact, actionable next steps a user might want to take.
These actions should be things that can be initiated with a button click and result in generating new content (text or an image).

**Instructions:**
1.  Read the plan to understand its components (e.g., Hero Section, CTA, SEO Keywords).
2.  Suggest actions that are directly relevant to the plan's content.
3.  For each action, provide a clear button label and a detailed, self-contained prompt for another AI model to execute.
4.  If the action is to generate an image, the prompt should be a descriptive scene for an image model. The type must be 'image'.
5.  If the action is to generate text (like copy, titles, or ideas), the prompt should be a clear instruction for a text model. The type must be 'text'.
6.  Do not suggest actions that are already primary features, like 'Generate a Mockup' or 'Generate Code'. Focus on *content creation* for specific parts of the plan.

**Good Examples:**
- Action: Generate an image for the hero section. -> { "label": "Generate Hero Image", "prompt": "...", "type": "image" }
- Action: Write copy for the call-to-action button. -> { "label": "Draft CTA Copy", "prompt": "...", "type": "text" }
- Action: Brainstorm domain names. -> { "label": "Suggest Domain Names", "prompt": "...", "type": "text" }

---
**Web Page Plan:**
${pagePlan}
---

Generate the actions based on the JSON schema provided.
`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        actions: {
                            type: Type.ARRAY,
                            description: "An array of 1 to 3 smart actions.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING, description: "The user-facing button text for the action." },
                                    prompt: { type: Type.STRING, description: "A detailed, self-contained prompt to be sent to another AI model." },
                                    type: { type: Type.STRING, description: "The type of content to generate: 'text' or 'image'." }
                                }
                            }
                        }
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        if (result && Array.isArray(result.actions)) {
            return result.actions.filter(a => a.label && a.prompt && (a.type === 'text' || a.type === 'image'));
        }
        return [];
    } catch (error) {
        console.error("Error generating smart actions:", error);
        return [];
    }
}

export async function* generateFreeformTextStream(prompt: string): AsyncGenerator<string, void, undefined> {
    if (!apiKey) {
        throw new Error("API Key Error: Gemini API key is not configured.");
    }

    try {
        const responseStream = await ai.models.generateContentStream({
            model: modelName,
            contents: prompt,
        });

        for await (const chunk of responseStream) {
            const text = chunk.text;
            if (typeof text === 'string' && text.length > 0) {
                yield text;
            }
        }
    } catch (error) {
        console.error("Error calling Gemini API for freeform text:", error);
        if (error instanceof Error) {
            if (error.message.toLowerCase().includes("api key")) {
                 throw new Error(`Gemini API Authentication Error: ${error.message}.`);
            }
            throw new Error(`Gemini API request failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating text.");
    }
}

export async function generateImageFromPrompt(prompt: string): Promise<string> {
    if (!apiKey) {
        throw new Error("API Key Error: Gemini API key is not configured.");
    }
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image.imageBytes) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            // @ts-ignore
            const promptFeedback = response.promptFeedback;
            if (promptFeedback?.blockReason) {
                const reason = `Reason: ${promptFeedback.blockReason}.`;
                // @ts-ignore
                const ratings = promptFeedback.safetyRatings?.map(r => `  - ${r.category}: ${r.probability}`).join('\n');
                throw new Error(`Image generation failed because the prompt was blocked by safety filters.\n${reason}\nDetails:\n${ratings || 'No safety ratings provided.'}`);
            }
            throw new Error("Image generation failed: The API returned no image data.");
        }
    } catch (error) {
        console.error("Error calling Gemini Image Generation API:", error);
        if (error instanceof Error) {
            if (error.message.toLowerCase().includes("api key")) {
                throw new Error(`Gemini API Authentication Error: ${error.message}.`);
            }
            throw new Error(`Image Generation failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the image.");
    }
}