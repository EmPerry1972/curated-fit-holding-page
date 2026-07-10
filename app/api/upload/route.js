import { put } from "@vercel/blob";

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const filename = request.headers.get("x-filename") || "upload";
    if (!contentType.startsWith("image/")) {
      return Response.json({ error: "Only image files are allowed" }, { status: 400 });
    }
    const blob = await put(`waitlist/${Date.now()}-${filename}`, request.body, { access: "public", contentType });
    return Response.json({ url: blob.url });
  } catch (err) {
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
