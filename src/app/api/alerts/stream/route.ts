import { generateAlert } from "@/lib/fake-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  let alertCounter = 0;

  const stream = new ReadableStream({
    async start(controller) {
      const sendAlert = () => {
        try {
          alertCounter++;
          const alert = generateAlert(`stream-${alertCounter}-${Date.now()}`);
          const data = `data: ${JSON.stringify(alert)}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch (e) {
          console.error("Error sending alert:", e);
        }
      };

      // Send new alert every 20-40 seconds
      const interval = setInterval(() => {
        sendAlert();
      }, 20000 + Math.random() * 20000);

      // Send initial alert after 5 seconds
      setTimeout(sendAlert, 5000);

      // Cleanup on close
      const cleanup = () => {
        clearInterval(interval);
      };

      // Keep connection alive
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          cleanup();
          clearInterval(keepAlive);
        }
      }, 15000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
