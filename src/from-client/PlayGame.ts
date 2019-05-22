import {Player} from "../Player";
import {User} from "../User";
import {ClientMessage, IMsgFromClient, MESSAGE_TYPE_FROM_CLIENT} from "./ClientMessage";

export interface IFromClientPlayMoveRoom extends IMsgFromClient {
    answer: any;
}

export class PlayGame extends ClientMessage {
    public readonly type: MESSAGE_TYPE_FROM_CLIENT = "playGame";

    public exec(message: IFromClientPlayMoveRoom, sender: User) {
        const room = this.game.rooms.findByPlayer(sender);
        if (!room || !room.isPlaying()) {
            sender.send({type: "genericAlert", message: "Unavailable room"});
            return;
        }
        if (sender.player) {
            const {player} = sender;
            if (!player.isValidPlayGame(message)) {
                player.send({type: "genericAlert", message: "Not a valid response"});
                return;
            }
            player.cleanAsked();
            player.playGame(message.answer);
        }

    }

}
