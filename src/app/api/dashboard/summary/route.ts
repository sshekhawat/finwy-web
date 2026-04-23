import { NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/server/auth-memory";

/** Demo summary for local `/api` mode; real backends can mirror this JSON shape. */
export async function GET(request: Request) {
  const user = getUserFromBearer(request.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    totalCreditLimitMin: 1000,
    totalCreditLimitMax: 50000,
    availableCreditLimit: 0,
  });
}
