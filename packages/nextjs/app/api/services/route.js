export async function GET(request) {
  return Response.json({ message: "Hello from the server!" });
}

export async function POST(request) {
  const data = await request.json(); // Parse the JSON data from the request body

  // Perform your desired server-side logic with the data
  // For example, save it to a database or send it to another API

  return new Response(JSON.stringify({ message: "Data received successfully!" }), {
    status: 200, // Or an appropriate status code
    headers: { "Content-Type": "application/json" },
  });
}