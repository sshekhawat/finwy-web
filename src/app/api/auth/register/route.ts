import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators/auth";
import { registerUser } from "@/lib/server/auth-memory";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);
    const result = registerUser({
      email: data.email,
      password: data.password,
      name: `${data.firstName} ${data.lastName}`.trim(),
    });

    // OTP is returned only for demo/dev flow.
    return NextResponse.json(
      {
        message: `${result.message}. Use OTP ${result.otpCode} for verification.`,
        otpCode: result.otpCode,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
