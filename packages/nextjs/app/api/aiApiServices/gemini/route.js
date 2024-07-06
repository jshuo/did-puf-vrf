const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


export async function POST(request) {
  const requestData = await request.json();
  const requestContent = requestData.content; // Assuming the request has a 'content' field

  console.log(JSON.stringify(requestContent));
  // 2. Formulate Summarization Prompt
  const prompt = `
Please review the details to determine if there is any indication that the item is manufactured in Taiwan. If it is, please respond with "Originating from Taiwan"; otherwise, provide an alternative response. :\n\n${JSON.stringify(
    requestContent,
  )}`;

  // 3. Set up model 
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  console.log(text)

  return new Response(JSON.stringify({ message: text }), {
    status: 200, // Or an appropriate status code
    headers: { 
      "Content-Type": "application/json",
     },
  });
}
