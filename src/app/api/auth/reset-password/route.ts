import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { resetPassword } from "@/lib/server/auth-memory";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = resetPasswordSchema.parse(body);
    const result = resetPassword(data);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reset password failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
