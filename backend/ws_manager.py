from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.rooms: dict[str, list[WebSocket]] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        self.rooms.setdefault(session_id, []).append(websocket)

    def disconnect(self, session_id: str, websocket: WebSocket):
        room = self.rooms.get(session_id, [])
        if websocket in room:
            room.remove(websocket)
        if not room:
            self.rooms.pop(session_id, None)

    async def broadcast(self, session_id: str, data: dict):
        dead: list[WebSocket] = []
        for ws in self.rooms.get(session_id, []):
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(session_id, ws)


manager = ConnectionManager()
