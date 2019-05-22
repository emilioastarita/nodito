import {Game} from "./Game";
import {User} from "./User";
import {Room} from "./Room";

export interface IRoomMakerDict {
    [name: string]: any;
}

export interface IGamePlayerMakerDict {
    [name: string]: any;
}

export class RoomManager {

    private rooms: Room[] = [];

    public constructor(
        private dictMaker: IRoomMakerDict,
        private classMaker: IGamePlayerMakerDict,
    ) {

    }

    public makeRoom(type: string, game: Game, players: number): Room {
        const makePlayer = this.classMaker[type];
        if (!this.dictMaker[type]) {
            throw new Error("Undefined constructor for RoomGame of type: " + type);
        }
        return new this.dictMaker[type](game, players, makePlayer);
    }

    public findByPlayer(p: User): Room | undefined {
        return this.rooms.find((x) => x.find(p) !== undefined);
    }

    public add(room: Room) {
        this.rooms.push(room);
    }

    public remove(room: Room) {
        this.rooms = this.rooms.filter((x) => x !== room);
    }

    public count(): number {
        return this.rooms.length;
    }

    public find(roomId: string) {
        return this.rooms.find((x) => x.getId() === roomId);
    }

    public toClient() {
        return this.rooms.map((x) => x.toClient());
    }
}
