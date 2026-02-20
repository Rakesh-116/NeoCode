import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiComplexityAnalyzer {
  constructor() {
    this.genAI = null;
    this.model = null;
  }

  initialize(apiKey) {
    if (!apiKey) {
      throw new Error("Gemini API key is required");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  getSystemPrompt() {
    return `You are a time complexity analyzer. Your ONLY job is to analyze code and return the time complexity in Big O notation.

CRITICAL RULES:
1. Return ONLY the Big O notation (e.g., "O(n)", "O(n²)", "O(log n)", "O(1)", "O(n log n)")
2. NO explanations, descriptions, or additional text
3. NO markdown formatting
4. If multiple complexities exist (best/average/worst case), return the worst case
5. For recursive algorithms, consider the recurrence relation
6. For nested loops, multiply the complexities
7. For sequential operations, take the dominant complexity

Examples of CORRECT responses:
- "O(n)"
- "O(n²)"
- "O(log n)"
- "O(n log n)"
- "O(1)"
- "O(2^n)"
- "O(n!)"

Examples of INCORRECT responses:
- "The time complexity is O(n)"
- "O(n) because there's one loop"
- "**O(n²)**"
- "Best case: O(1), Worst case: O(n)"

Analyze the following code and return ONLY the time complexity:`;
  }

  async analyzeComplexity(code, language) {
    if (!this.model) {
      throw new Error("Gemini model not initialized. Call initialize() first.");
    }

    try {
      const prompt = `${this.getSystemPrompt()}

Language: ${language}
Code:
\`\`\`${language.toLowerCase()}
${code}
\`\`\``;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const complexity = response.text().trim();

      // Validate the response format
      if (this.isValidComplexity(complexity)) {
        return {
          success: true,
          complexity: complexity,
          language: language
        };
      } else {
        // If Gemini didn't follow the format, try to extract O(...) notation
        const extracted = this.extractComplexity(complexity);
        if (extracted) {
          return {
            success: true,
            complexity: extracted,
            language: language
          };
        }
        
        throw new Error("Invalid complexity format received from AI");
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      return {
        success: false,
        error: error.message || "Failed to analyze complexity",
        language: language
      };
    }
  }

  isValidComplexity(text) {
    // Check if the response matches O(...) pattern
    const complexityPattern = /^O\([^)]+\)$/;
    return complexityPattern.test(text);
  }

  extractComplexity(text) {
    // Try to extract O(...) from the response if Gemini added extra text
    const match = text.match(/O\([^)]+\)/);
    return match ? match[0] : null;
  }
}

export default GeminiComplexityAnalyzer;