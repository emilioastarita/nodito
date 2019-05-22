import {User} from "../User";
import {ClientMessage, IMsgFromClient, MESSAGE_TYPE_FROM_CLIENT} from "./ClientMessage";

export class Status extends ClientMessage {
    public readonly type: MESSAGE_TYPE_FROM_CLIENT = "status";

    public exec(message: IMsgFromClient, sender: User) {
        if (sender.player && sender.player.isPlaying()) {
            sender.player.reconnection();
        }
        sender.sendStatus();
    }

}
