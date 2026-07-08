import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Only initialize if we have a key
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// We use the universally supported pro model as fallback
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-pro" }) : null;

export async function generateGeminiResponse(
  question: string,
  financialData: any,
  userName: string
): Promise<string> {
  if (!model) {
    return "Error: Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.";
  }

  // Construct a comprehensive system prompt with the user's data
  const systemPrompt = `
You are SmartFin Advisor, a highly intelligent, friendly, and concise financial AI assistant.
Your goal is to help the user (${userName}) understand their finances, budget better, and save money.
Always respond in a helpful, encouraging tone using markdown for formatting (bolding, lists, emojis).
Do NOT offer generic advice if you can provide specific advice based on the user's data.

Here is ${userName}'s current financial snapshot based on their real data:
- Total Income: $${financialData.totalIncome.toLocaleString()}
- Total Expenses: $${financialData.totalExpense.toLocaleString()}
- Net Savings: $${financialData.netSavings.toLocaleString()}
- Savings Rate: ${financialData.savingsRate.toFixed(1)}%
- Average Daily Spend: $${financialData.avgDailySpend.toFixed(2)}
- Top Expense Categories: ${financialData.topExpenseCategories.map((c: any) => `${c.category} ($${c.total})`).join(', ')}
- Budget Alerts: ${financialData.budgetHealth.filter((b: any) => b.status !== 'safe').map((b: any) => `${b.category} (${b.percentage.toFixed(0)}% spent)`).join(', ') || 'None'}

Answer the user's question directly based ONLY on this context and general financial best practices. 
Keep your response under 150 words unless they ask for a detailed breakdown.
`;

  try {
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am ready to act as the SmartFin Advisor using this data." }],
        },
      ],
    });

    const result = await chat.sendMessage(question);
    return result.response.text();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return `Sorry, I encountered an error while analyzing your data: ${error.message}`;
  }
}
