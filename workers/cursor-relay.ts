export class CursorRoom {
  state: DurableObjectState;
  sessions: Map<WebSocket, string>; // Map ws -> visitorId

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.sessions = new Map();
  }

  async fetch(request: Request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected Upgrade: websocket", { status: 426 });
    }

    if (this.sessions.size >= 15) {
      return new Response("Room Full", { status: 1008 });
    }

    const { 0: client, 1: server } = new WebSocketPair();

    server.accept();
    const visitorId = Math.random().toString(36).substr(2, 9);
    this.sessions.set(server, visitorId);

    server.addEventListener("message", event => {
      // Broadcast to everyone else
      for (let session of this.sessions.keys()) {
        if (session !== server) {
          try {
            session.send(event.data);
          } catch (err) {
            // connection dropped
          }
        }
      }
    });

    server.addEventListener("close", () => {
      this.sessions.delete(server);
    });

    server.addEventListener("error", () => {
      this.sessions.delete(server);
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
}

export interface Env {
  CURSOR_ROOM: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env) {
    const id = env.CURSOR_ROOM.idFromName("global");
    const room = env.CURSOR_ROOM.get(id);
    return room.fetch(request);
  }
};
