import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});


export async function POST(request) {
  const requestData = await request.json();
  const requestContent = requestData.content; // Assuming the request has a 'content' field

  console.log(JSON.stringify(requestContent));
  // 2. Formulate Summarization Prompt
  const prompt = `
Please review the details to determine if there is any indication that the item is manufactured in Taiwan. If it is, please respond with "Originating from Taiwan"; otherwise, provide an alternative response. :\n\n${JSON.stringify(
    requestContent,
  )}`;

  // 3. Send Request to OpenAI
  // model: "gpt-4",
  // model: "gpt-3.5-turbo"
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  // 4. Return Summary
  const summary = response.choices[0].message.content;
  // console.log(summary);
  // Perform your desired server-side logic with the data
  // For example, save it to a database or send it to another API

  return new Response(JSON.stringify({ message: summary }), {
    status: 200, // Or an appropriate status code
    headers: { 
      "Content-Type": "application/json",
     },
  });
}
