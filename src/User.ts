import {IMsgFromServer} from "./from-server/IFromServer";
import {Player} from "./Player";
import {Room} from "./Room";

export class User<TPlayer extends Player = Player> {
    protected lastSeen = new Date();
    protected name = "";
    private _player: TPlayer | null = null;

    constructor(
        private id: string = "",
        private token: string = "",
        private sendToClient: (msg: IMsgFromServer) => void = ((x) => x),
    ) {

    }

    get player(): TPlayer | null {
        return this._player;
    }

    set player(value: TPlayer | null) {
        this._player = value;
    }

    public playGame(msg: any) {
        if (this.player) {
            this.player.playGame(msg);
        }
    }

    public getName() {
        return this.name;
    }

    public setName(x: string) {
        this.name = x;
    }

    public setRoom(x: Room|null) {
        if (this.player) {
            this.player.setRoom(x);
        }
    }

    public getId() {
        return this.id;
    }

    public getToken() {
        return this.token;
    }

    public send(msg: IMsgFromServer) {
        this.sendToClient(msg);
    }

    public toClient(turn = false) {
        return {
            id: this.getId(),
            name: this.getName(),
            playing: this.player && this.player.isPlaying(),
            turn: turn ?  this.player && this.player.getTurn() : {},
        };
    }

    public sendStatus() {
        if (this.player) {
            this.player.sendStatus();
        }
    }

    public markLastSeen() {
        this.lastSeen = new Date();
    }

    public secondsFromLastSeen() {
        const now = new Date();
        return Math.abs(now.getTime() - this.lastSeen.getTime()) / 1000;
    }

    public isPlaying() {
        return this.player && this.player.isPlaying();
    }
}
