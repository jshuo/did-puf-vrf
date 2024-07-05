import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

export async function GET(request) {
  // 1. Extract Request Content
  const requestData = await request.json();
  const requestContent = requestData.content; // Assuming the request has a 'content' field

  if (!requestContent) {
    return json({ error: "Missing 'content' in request body" }, { status: 400 }); // Bad Request
  }

  // 2. Formulate Summarization Prompt
  const prompt = `Please provide a concise summary of the following text:\n\n${requestContent}`;

  // 3. Send Request to OpenAI
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  // 4. Return Summary
  const summary = response.choices[0].message.content;
  return json({ summary });
}

export async function POST(request) {

  const requestData = await request.json();
  const requestContent = requestData.content; // Assuming the request has a 'content' field

  console.log(JSON.stringify(requestContent))
  // 2. Formulate Summarization Prompt
  const prompt = `Please provide a concise summary of the following text:\n\n${JSON.stringify(requestContent)}`;



  // 3. Send Request to OpenAI
  // model: "gpt-4",
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  // 4. Return Summary
  const summary = response.choices[0].message.content;
  console.log(summary)
  // Perform your desired server-side logic with the data
  // For example, save it to a database or send it to another API

  return new Response(JSON.stringify({ message: summary }), {
    status: 200, // Or an appropriate status code
    headers: { "Content-Type": "application/json" },
  });
}
