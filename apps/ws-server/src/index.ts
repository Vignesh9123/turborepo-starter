import ws from 'ws';


interface MessageJson{
    type: "join" | "message"| "leave",
    message: string,
    roomId?: string
}


const rooms = new Map<string, Set<ws>>();
const socketsToRooms = new Map<ws, string>();

const wss = new ws.Server({ port: 8080 });
wss.on('connection', (ws) => {
    ws.on('message', (message, isBinary) => {
        const messageJson = JSON.parse(message.toString()) as MessageJson;
        if(messageJson.type == 'join'){
            console.log("Joining room", messageJson.roomId);
            if(!messageJson.roomId){
                return;
            }
            if(!rooms.has(messageJson.roomId)){
                rooms.set(messageJson.roomId, new Set());
            }
            if(!rooms.get(messageJson.roomId)){
                return;
            }
            rooms.get(messageJson.roomId)?.add(ws);
            socketsToRooms.set(ws, messageJson.roomId);
        }
        else if(messageJson.type == 'leave'){
            if(!messageJson.roomId){
                return;
            }
            if(!rooms.has(messageJson.roomId)){
                return;
            }
            rooms.get(messageJson.roomId)?.delete(ws);
            socketsToRooms.delete(ws);
            if(rooms.get(messageJson.roomId)?.size == 0){
                rooms.delete(messageJson.roomId);
            }
        }
        else if(messageJson.type == 'message'){
            const roomId = socketsToRooms.get(ws);
            if(!roomId){
                return;
            }
            if(!rooms.has(roomId)){
                return;
            }
            rooms.get(roomId)?.forEach((client) => {
                if(client == ws){
                    return;
                }
                console.log("Sending message", messageJson.message.toString(), 'to', messageJson.roomId);
                client.send(message, {binary: isBinary});
            });
        }
    });
});

wss.on("listening", () => {
    console.log("Websocket Listening on port 8080");
})