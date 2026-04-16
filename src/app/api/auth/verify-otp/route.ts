import { NextResponse } from "next/server";
import { verifyOtpSchema } from "@/lib/validators/auth";
import { verifyOtp } from "@/lib/server/auth-memory";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = verifyOtpSchema.parse(body);
    const result = verifyOtp(data);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "OTP verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
