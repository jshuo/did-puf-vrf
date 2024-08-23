import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});


export async function POST(request) {
  const requestData = await request.json();
  const requestContent = requestData.content; // Assuming the request has a 'content' field

  // 2. Formulate Summarization Prompt
  const prompt = `
  Please review the details to determine if there is any indication that the item is manufactured in Taiwan. If it is, please respond with "Originating from Taiwan"; otherwise, provide an alternative response. :\n\n${JSON.stringify(
    requestContent,
  )}`;

  // 3. Send Request to OpenAI
  // model: "gpt-4",
  // model: "gpt-3.5-turbo"
  const gptModel = "gpt-3.5-turbo";
  const response = await openai.chat.completions.create({
    model: gptModel,
    messages: [
      { role: "system", content: "You are an expert in determining the origin of manufactured goods." },
      { role: "user", content: prompt }
    ],
  });

  // 4. Return Summary
  const summary = response.choices[0].message.content;
  console.log(summary);

  const imagePrompt = `
  draw an image per the following json data. :\n\n${JSON.stringify(
    requestContent,
  )}`;

  const image_url = "https://oaidalleapiprodscus.blob.core.windows.net/private/org-C1gvNJtoU4OBHbBfKiqDxbOJ/user-qAGQDdCOsRSf4lSE4mD8FFH3/img-B1PoRHYndMSE1H9rgkkiw9Ob.png?st=2024-07-09T08%3A24%3A54Z&se=2024-07-09T10%3A24%3A54Z&sp=r&sv=2023-11-03&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-07-08T18%3A15%3A07Z&ske=2024-07-09T18%3A15%3A07Z&sks=b&skv=2023-11-03&sig=Eak1Y8v%2BdaW1OfAMUkS3r/nI0K0CMm92SsmrUs4BMVA%3D"

  // Perform your desired server-side logic with the data
  // For example, save it to a database or send it to another API

  return new Response(JSON.stringify({ message: "OPENAI Model " + " used: " + summary, image: image_url }), {
    status: 200, // Or an appropriate status code
    headers: {
      "Content-Type": "application/json",
    },
  });
}
