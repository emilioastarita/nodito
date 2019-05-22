import {User} from "../User";
import {ClientMessage, IMsgFromClient, MESSAGE_TYPE_FROM_CLIENT} from "./ClientMessage";

export interface IFromClientJoinRoom extends IMsgFromClient {
    roomId: string;
}

export class JoinRoom extends ClientMessage {
    public readonly type: MESSAGE_TYPE_FROM_CLIENT = "joinRoom";

    public exec(message: IFromClientJoinRoom, sender: User) {
        const room = this.game.rooms.find(message.roomId);
        if (!room) {
            sender.send({type: "genericAlert", message: "¡La sala ya no existe!"});
            this.game.throttledSendRooms();
            return;
        }

        const inRoom = this.game.rooms.findByPlayer(sender);
        if (room.isReady() && !room.find(sender)) {
            sender.send({type: "genericAlert", message: "¡La sala ya está llena!"});
            this.game.throttledSendRooms();
            return;
        }
        if (inRoom && inRoom.getId() !== message.roomId) {
            inRoom.remove(sender);
            if (inRoom.empty()) {
                this.game.rooms.remove(inRoom);
            }
        }
        room.add(sender);
        if (room.isReady()) {
            room.start();
        }
        this.game.throttledSendRooms();
    }

}
