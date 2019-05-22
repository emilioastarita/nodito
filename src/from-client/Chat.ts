import {User} from "../User";
import {ClientMessage, IMsgFromClient, MESSAGE_TYPE_FROM_CLIENT} from "./ClientMessage";

export interface IFromClientChat extends IMsgFromClient {
    message: string;
}

export class Chat extends ClientMessage {
    public readonly type: MESSAGE_TYPE_FROM_CLIENT = "chat";

    public exec(msg: IFromClientChat, sender: User) {
        if (!msg.message.length) {
            return;
        }
        this.game.users.sendToAll({
            message: msg.message.slice(0, 255),
            timestamp: (new Date()).getTime(),
            type: "chat",
            who: sender.toClient(),
        });
    }
}
