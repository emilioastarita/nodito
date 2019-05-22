import {User} from "../User";
import {ClientMessage, IMsgFromClient, MESSAGE_TYPE_FROM_CLIENT} from "./ClientMessage";

export class Ping extends ClientMessage {
    public readonly type: MESSAGE_TYPE_FROM_CLIENT = "ping";

    public exec(message: IMsgFromClient, sender: User) {
        sender.send({type: "pong"});
    }

}
