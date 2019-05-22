import {User} from "../User";
import {ClientMessage, IMsgFromClient, MESSAGE_TYPE_FROM_CLIENT} from "./ClientMessage";

export interface IFromClientCreateRoom extends IMsgFromClient {
    gameType: string;
    maxPlayers: number;
}

export class CreateRoom extends ClientMessage {
    public readonly type: MESSAGE_TYPE_FROM_CLIENT = "createRoom";

    public validate(message: IFromClientCreateRoom): boolean {
        return message.maxPlayers > 1 && message.maxPlayers <= 2;
    }

    public exec(message: IFromClientCreateRoom, sender: User) {
        const inRoom = this.game.rooms.findByPlayer(sender);
        if (inRoom) {
            inRoom.remove(sender);
            if (inRoom.empty()) {
                this.game.rooms.remove(inRoom);
            }
        }

        const room = this.game.rooms.makeRoom(message.gameType, this.game, message.maxPlayers);
        room.add(sender);
        this.game.rooms.add(room);
        this.game.throttledSendRooms();
    }

}
