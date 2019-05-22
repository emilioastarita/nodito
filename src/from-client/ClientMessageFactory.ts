import {Game} from "../Game";
import {Room} from "../Room";
import {Chat} from "./Chat";
import {ClientMessage, IMsgFromClient, MESSAGE_TYPE_FROM_CLIENT} from "./ClientMessage";
import {CreateRoom} from "./CreateRoom";
import {Info} from "./Info";
import {JoinRoom} from "./JoinRoom";
import {Ping} from "./Ping";
import {PlayGame} from "./PlayGame";
import {Status} from "./Status";

export class ClientMessageFactory {

    private initMakers = [
        CreateRoom,
        Chat,
        Info,
        JoinRoom,
        Ping,
        PlayGame,
        Status,
    ];

    private executors: {
        [T in MESSAGE_TYPE_FROM_CLIENT]?: ClientMessage
    } = {};

    public install(game: Game<Room>) {
        this.initMakers.forEach((maker) => {
            const executor = new maker(game);
            this.executors[executor.type] = executor;
        });
    }

    public exec(message: IMsgFromClient): boolean {
        const executor = this.executors[message.type];
        if (!executor) {
            console.error("Invalid type", message.type);
            return false;
        }
        return executor.execMessage(message);
    }
}
