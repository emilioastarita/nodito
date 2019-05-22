import {IFromClientPlayMoveRoom} from "./from-client/PlayGame";
import {Room} from "./Room";
import {User} from "./User";

type MoveCommand = any;
import Timeout = NodeJS.Timeout;

export class Player {

    get user(): User | null {
        return this._user;
    }

    set user(value: User | null) {
        this._user = value;
    }

    protected _user: User | null = null;
    protected room: Room | null = null;
    protected inTurn = false;
    protected takenTurnTime: Date | null = null;
    protected asked: MoveCommand[] = [];
    protected _removeTimer: Timeout | null = null;

    public playGame(msg: any) {
        throw new Error("Implement play game.");
    }

    public cleanAsked() {
        this.asked = [];
        this.inTurn = false;
        this.cleanTurnTimer();
    }

    public takeTurn(questions: MoveCommand[]) {
        this.inTurn = true;
        this.takenTurnTime = new Date();
        this.setupRemove();
        this.asked = questions;
        this.room!.sendStatusToAll();
    }

    public reconnection() {
        this.room!.sendStatusToAll();
    }

    public getTurn() {
        return {
            seconds: this.calcSeconds(),
            turn: this.isInTurn(),
        };
    }

    public setRoom(room: Room | null) {
        this.room = room;
    }

    public setInTurn(b: boolean) {
        this.inTurn = b;
    }

    public isValidPlayGame(message: IFromClientPlayMoveRoom) {
        return this.asked.find((x) => JSON.stringify(x) === JSON.stringify(message.answer));
    }

    public restOfPlayers(): Player[] {
        if (!this.room) {
            return [];
        }
        return this.room.getGamePlayers()
            .filter((x) => x !== this);
    }

    public opponent() {
        return this.restOfPlayers()[0];
    }

    public sendStatus() {
        throw new Error("Implement sendStatus");
    }

    public isInTurn() {
        return this.inTurn;
    }

    public isPlaying() {
        return this.room && this.room.isPlaying();
    }

    public send(msg: any) {
        if (this.user) {
            this.user.send(msg);
        }
    }

    protected calcSeconds() {
        const now = new Date();
        const takenTurn = this.takenTurnTime ? this.takenTurnTime : new Date();
        const turnMaxTime = this.room!.game.options.turnMaxTime;
        const ret = Math.max(0, turnMaxTime - (now.getTime() - takenTurn.getTime()));
        return Math.floor(ret / 1000);
    }

    protected setupRemove() {
        this.cleanTurnTimer();
        this._removeTimer = setTimeout(() => {
            if (this.isInTurn() && this.calcSeconds() === 0) {
                this.send({type: "abandonGame", you: true});
                let who = {};
                if (this.user) {
                    who = this.user.toClient();
                }
                this.restOfPlayers().forEach((x) => x.send({type: "abandonGame", who, you: false}));
                if (this.room) {
                    this.room.finish();
                }
            }
        }, this.calcSeconds() * 1000);
    }

    protected cleanTurnTimer() {
        if (this._removeTimer) {
            clearTimeout(this._removeTimer);
        }
    }

}
