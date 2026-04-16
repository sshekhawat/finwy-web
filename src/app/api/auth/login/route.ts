import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators/auth";
import { loginUser } from "@/lib/server/auth-memory";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);
    const result = loginUser(data);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
