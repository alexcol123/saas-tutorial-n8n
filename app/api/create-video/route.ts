// app/api/create-video/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Get the form data from the request
    const formData = await request.formData();

    // Extract all the form fields
    const facePhoto = formData.get("Face_Photo") as File | null;
    const spokenTextTopic = formData.get("Spoken_Text_Topic") as string | null;
    const gender = formData.get("Gender") as string | null;
    const sceneSetting = formData.get("Scene_Setting") as string | null;
    const characterStyle = formData.get("Character_Style") as string | null;
    const famousFaceBlend = formData.get("Famous_Face_Blend") as string | null;
    const email = formData.get("Email") as string | null;

    // Validate required fields
    if (
      !facePhoto ||
      !spokenTextTopic ||
      !gender ||
      !sceneSetting ||
      !characterStyle ||
      !famousFaceBlend ||
      !email
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!facePhoto.type || !facePhoto.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Face photo must be an image file" },
        { status: 400 }
      );
    }

    // Create new FormData for n8n
    const n8nFormData = new FormData();
    n8nFormData.append("Face_Photo", facePhoto);
    n8nFormData.append("Spoken_Text_Topic", spokenTextTopic);
    n8nFormData.append("Gender", gender);
    n8nFormData.append("Scene_Setting", sceneSetting);
    n8nFormData.append("Character_Style", characterStyle);
    n8nFormData.append("Famous_Face_Blend", famousFaceBlend);
    n8nFormData.append("Email", email);

    // Your n8n webhook URL - replace this with your actual webhook URL
    const N8N_WEBHOOK_URL =
      process.env.N8N_WEBHOOK_URL || "YOUR_N8N_WEBHOOK_URL_HERE";

    if (N8N_WEBHOOK_URL === "YOUR_N8N_WEBHOOK_URL_HERE") {
      return NextResponse.json(
        { error: "N8N webhook URL not configured" },
        { status: 500 }
      );
    }

    // Send request to n8n webhook
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      body: n8nFormData,
      // Don't set Content-Type header - let the browser set it with boundary for multipart/form-data
    });

    console.log( n8nResponse)
    console.log('----------------------------------------')

    if (!n8nResponse.ok) {
      console.error(
        "N8N webhook error:",
        n8nResponse.status,
        n8nResponse.statusText
      );
      return NextResponse.json(
        { error: "Failed to process video creation request" },
        { status: 500 }
      );
    }

    const n8nResult = (await n8nResponse.json().catch(() => null)) as {
      "image-generated"?: string;
    } | null;

    // Check if n8n returned a base64 image
    let imageData: string | null = null;
    if (n8nResult && n8nResult["image-generated"]) {
      imageData = n8nResult["image-generated"];
    }

    return NextResponse.json(
      {
        success: true,
        message: "Video creation request submitted successfully",
        data: n8nResult,
        imageGenerated: imageData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: Handle OPTIONS request for CORS if needed
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
