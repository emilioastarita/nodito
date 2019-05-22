import {Game} from "../Game";
import {User} from "../User";

export type MESSAGE_TYPE_FROM_CLIENT =
    "generic" |
    "ping" |
    "info" |
    "chat" |
    "createRoom" |
    "status" |
    "playGame" |
    "joinRoom";

export interface IMsgFromClient {
    clientId: string;
    token: string;
    type: MESSAGE_TYPE_FROM_CLIENT;

    [others: string]: any;
}

export abstract class ClientMessage {
    public readonly type: MESSAGE_TYPE_FROM_CLIENT = "generic";

    constructor(
        protected game: Game,
    ) {
    }

    public execMessage(message: IMsgFromClient): boolean {
        const sender = this.game.users.findByMessage(message);
        if (!sender) {
            return false;
        }
        if (!this.validate(message, sender)) {
            return false;
        }
        sender.markLastSeen();
        this.exec(message, sender);
        return true;
    }

    public validate(message: IMsgFromClient, sender: User): boolean {
        return true;
    }

    protected abstract exec(message: IMsgFromClient, sender: User): void;
}
