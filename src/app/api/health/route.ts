export function GET() {
  return Response.json({
    service: "maru-web",
    status: "ok",
    version: "0.1.0",
  });
}
