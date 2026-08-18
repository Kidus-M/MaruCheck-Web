import { getAuth, isAuthConfigured } from "@/lib/auth";

async function handleAuthRequest(request: Request): Promise<Response> {
  if (!isAuthConfigured()) {
    return Response.json(
      { error: "Authentication is not configured for this deployment." },
      { status: 503 },
    );
  }
  return getAuth().handler(request);
}

export const GET = handleAuthRequest;
export const POST = handleAuthRequest;
export const PATCH = handleAuthRequest;
export const PUT = handleAuthRequest;
export const DELETE = handleAuthRequest;
