import GeminiComplexityAnalyzer from "../services/geminiComplexityAnalyzer.js";

const analyzer = new GeminiComplexityAnalyzer();

// Initialize with environment variable
const initializeAnalyzer = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not found in environment variables");
    return false;
  }
  
  try {
    analyzer.initialize(apiKey);
    console.log("Gemini Complexity Analyzer initialized successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize Gemini Complexity Analyzer:", error);
    return false;
  }
};

const analyzeComplexityController = async (req, res) => {
  try {
    const { code, language } = req.body;

    // Validate input
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: "Code and language are required"
      });
    }

    // Validate supported languages
    const supportedLanguages = ['java', 'python', 'cpp', 'c++', 'javascript', 'c'];
    if (!supportedLanguages.includes(language.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Unsupported language: ${language}`
      });
    }

    // Check if analyzer is initialized
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        error: "Complexity analysis service not configured"
      });
    }

    // Initialize if not already done
    if (!analyzer.model) {
      const initialized = initializeAnalyzer();
      if (!initialized) {
        return res.status(503).json({
          success: false,
          error: "Failed to initialize complexity analysis service"
        });
      }
    }

    // Analyze the code
    const result = await analyzer.analyzeComplexity(code, language);

    if (result.success) {
      return res.status(200).json({
        success: true,
        complexity: result.complexity,
        language: result.language,
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error("Complexity analysis controller error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error during complexity analysis"
    });
  }
};

export { analyzeComplexityController, initializeAnalyzer };