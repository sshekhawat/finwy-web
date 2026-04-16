import { NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/server/auth-memory";

export async function GET(request: Request) {
  const user = getUserFromBearer(request.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(user);
}
