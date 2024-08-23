export async function POST(request) {
  const requestData = await request.json();
  const requestContent = requestData.content; // Assuming the request has a 'content' field

  const prompt = `
  Please review the details to determine if there is any indication that the item is manufactured in Taiwan. If it is, please respond with "Originating from Taiwan"; otherwise, provide an alternative response. :\n\n${JSON.stringify(
    requestContent,
  )}`;

  try {
    const response = await fetch("http://127.0.0.1:8000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: requestContent }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text()

    return new Response(JSON.stringify({ message: data }), {
      status: 200, // Or an appropriate status code
      headers: {
        "Content-Type": "application/json; charset=utf-8", // Ensure UTF-8 encoding
      },
    });
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw error; // Handle the error appropriately
  }
}
