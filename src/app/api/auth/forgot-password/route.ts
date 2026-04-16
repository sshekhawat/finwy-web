import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { requestPasswordReset } from "@/lib/server/auth-memory";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = forgotPasswordSchema.parse(body);
    const result = requestPasswordReset(data);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to request reset";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
