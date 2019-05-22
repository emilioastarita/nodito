import {User} from "../User";
import {isValidUserName} from "../utils";
import {ClientMessage, IMsgFromClient, MESSAGE_TYPE_FROM_CLIENT} from "./ClientMessage";

export interface IFromClientInfo extends IMsgFromClient {
    name?: string;
}

export class Info extends ClientMessage {
    public readonly type: MESSAGE_TYPE_FROM_CLIENT = "info";

    public exec(message: IFromClientInfo, sender: User) {
        if (message.name) {
            const exists = this.game.users.findByName(message.name);
            if (!isValidUserName(message.name)) {
                sender.send({type: "genericAlert", message: "¡El nombre es inválido! Sin espacios A-z/0-9 Max 15"});
            } else if (exists && sender !== exists) {
                sender.send({type: "genericAlert", message: "¡El nombre ya está en uso"});
            } else {
                sender.setName(message.name);
            }
        }
        sender.send({type: "info", info: this.game.infoOf(sender)});
        this.game.throttledSendPlayers();
        this.game.throttledSendRooms();
    }

}
