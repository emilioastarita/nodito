export type MESSAGE_TYPE_FROM_SERVER =
    "alreadyRoom"
    | "startGame"
    | "pong"
    | "rooms"
    | "players"
    | "info"
    | "genericAlert"
    | "turn"
    | "questions"
    | "playStatus"
    | "loseGame"
    | "winGame"
    | "tieGame"
    | "chat"
    | "abandonGame"
    | "updateState";

export interface IMsgFromServer {
    type: MESSAGE_TYPE_FROM_SERVER;
    [others: string]: any;
}
