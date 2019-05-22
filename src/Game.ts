import Timeout = NodeJS.Timeout;
import * as _ from "underscore";
import {IMsgFromClient} from "./from-client/ClientMessage";
import {ClientMessageFactory} from "./from-client/ClientMessageFactory";
import {Room} from "./Room";
import {RoomManager} from "./RoomManager";
import {User} from "./User";
import {UserManager} from "./UserManager";
import {sign} from "./utils";

export interface IGameOptions {
    cleanInterval: number;
    roomsInterval: number;
    usersInterval: number;
    checkPlayerOnlineInterval: number;
    turnMaxTime: number;
}

export class Game<TRoom extends Room = Room> {

    public throttledSendRooms = _.throttle(() => {
        const rooms = this.rooms.toClient();
        this.users.sendToAll({type: "rooms", rooms});
    }, 1000);

    public throttledSendPlayers = _.throttle(() => {
        const players = this.users.toClient();
        this.users.sendToAll({type: "players", players});
    }, 1000);

    private roomsMessageInterval: Timeout | null = null;
    private playersMessageInterval: Timeout | null = null;
    private checkPlayerOnlineInterval: Timeout | null = null;

    constructor(
        public users: UserManager,
        public rooms: RoomManager,
        private factory: ClientMessageFactory,
        private secretToken: string,
        public options: IGameOptions = {
            checkPlayerOnlineInterval: 1000 * 5,
            cleanInterval: 5000 * 5,
            roomsInterval: 1000 * 15,
            turnMaxTime: 1000 * 30,
            usersInterval: 1000 * 15,
        },
    ) {
        this.factory.install(this);
        this.roomsMessageInterval = setInterval(this.throttledSendRooms, this.options.roomsInterval);
        this.playersMessageInterval = setInterval(this.throttledSendPlayers, this.options.usersInterval);
        this.checkPlayerOnlineInterval =
            setInterval(this.checkPlayersTime.bind(this), this.options.checkPlayerOnlineInterval);
    }

    public findOrCreate(id: string): User {
        let player = this.users.find(id);
        if (!player) {
            player = this.users.makeUser(id, this.signToken(id));
            this.users.add(player);
        }
        return player;
    }

    public infoOf(player: User): any {
        const room = this.rooms.findByPlayer(player);
        const playing = (room && room.isPlaying());
        return {
            ...player.toClient(),
            isPlaying: playing,
        };
    }

    public signToken(id: string) {
        return sign(this.secretToken, id);
    }

    public exec(message: IMsgFromClient): any {
        return this.factory.exec(message);
    }

    public checkPlayersTime() {
        const players = this.users.getUsersForRemove();
        players.forEach((p) => {
            this.users.remove(p);
            const r = this.rooms.findByPlayer(p);
            if (r) {
                r.remove(p);
                if (r.empty()) {
                    this.rooms.remove(r);
                }
            }
        });
        if (players.length) {
            console.log("Removed users by expired time: " + players.length);
        }
    }

}
