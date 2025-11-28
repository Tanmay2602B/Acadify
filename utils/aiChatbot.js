const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to get AI response
const getAIResponse = async (prompt) => {
  try {
    // For text-only input, use the gemini-1.5-flash model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Error with AI response:", error);
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
};

// Function to format AI response for academic questions
const getAcademicAIResponse = async (question, subject, level) => {
  const prompt = `You are an academic assistant helping ${level} level students with ${subject}. 
  Please provide a clear, concise, and educational response to the following question:
  
  Question: ${question}
  
  Please format your response in a student-friendly way with:
  1. A clear explanation
  2. Examples if relevant
  3. Key points to remember
  4. Further reading suggestions if applicable
  
  Keep the response appropriate for ${level} level students.`;

  return await getAIResponse(prompt);
};

module.exports = {
  getAIResponse,
  getAcademicAIResponse
};