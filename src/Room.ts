import {IMsgFromServer} from "./from-server/IFromServer";
import {Game} from "./Game";
import {Player} from "./Player";
import {User} from "./User";
import {notEmpty, randomId} from "./utils";

export class Room<TGamePlayer extends Player = Player> {
    protected users: Array<User<TGamePlayer>> = [];
    protected startDate: Date | null = null;
    protected endDate: Date | null = null;
    protected type: string = "room";

    constructor(
        public game: Game<Room>,
        protected maxPlayers: number,
        protected playerMaker: new() => Player,
        protected id: string = randomId(),
    ) {

    }

    public getId(): string {
        return this.id;
    }

    public add(u: User<TGamePlayer>) {
        if (this.find(u)) {
            return false;
        }
        if (this.count() + 1 > this.maxPlayers) {
            return false;
        }
        this.users.push(u);
    }

    public count() {
        return this.users.length;
    }

    public find(u: User): User | undefined {
        return this.users.find((x) => x === u);
    }

    public findById(id: string): User | undefined {
        return this.users.find((x) => x.getId() === id);
    }

    public remove(u: User) {
        this.users = this.users.filter((x) => x !== u);
    }

    public empty() {
        return this.users.length === 0;
    }

    public isReady() {
        return this.users.length === this.maxPlayers;
    }

    public isPlaying() {
        return !!this.startDate && this.endDate === null;
    }

    public start() {
        if (!this.isReady()) {
            throw new Error("Bad call to start");
        }
        this.each((x) => {
            x.player = new this.playerMaker();
            x.setRoom(this);
            x.player.user = x;
        });
        this.startDate = new Date();
        this.sendAll({type: "startGame"});
        this.game.throttledSendRooms();
    }

    public finish() {
        this.each((x) => {
            if (x.player) {
                x.player.cleanAsked();
            }
            x.setRoom(null);
        });
        this.endDate = new Date();
        this.game.rooms.remove(this);
        this.game.throttledSendRooms();
    }

    public isFinished() {
        return this.endDate !== null;
    }

    public toClient() {
        return {
            count: this.count(),
            id: this.getId(),
            isPlaying: this.isPlaying(),
            owner: this.owner() ? this.owner().toClient() : null,
            total: this.maxPlayers,
            type: this.getType(),
        };
    }

    public each(fn: (p: User) => void) {
        this.users.forEach(fn);
    }

    public getPlayers(): Array<User<TGamePlayer>> {
        return this.users;
    }

    public getGamePlayers(): TGamePlayer[] {
        return this.getPlayers()
            .map((x) => x.player)
            .filter(notEmpty);
    }

    public sendStatusToAll() {
        this.each((x) => x.sendStatus());
    }

    public filterPlayer(fn: (x: User) => boolean) {
        return this.users.filter(fn);
    }

    protected owner() {
        return this.users[0];
    }

    protected sendAll(msg: IMsgFromServer) {
        this.users.forEach((x) => x.send(msg));
    }

    protected getType() {
        return this.type;
    }
}
