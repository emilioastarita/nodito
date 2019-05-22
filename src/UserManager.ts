import {IMsgFromClient} from "./from-client/ClientMessage";
import {IMsgFromServer} from "./from-server/IFromServer";
import {User} from "./User";

export class UserManager {

    private users: User[] = [];

    constructor(
        private sendToClient: (id: string, msg: IMsgFromServer) => void = (_, x) => x) {
    }

    public add(x: User): boolean {
        if (this.find(x.getId())) {
            return false;
        }
        this.users.push(x);
        return true;
    }

    public remove(p: User) {
        this.users = this.users.filter((x) => x !== p);
    }

    public find(id: string): User | undefined {
        return this.users.find((x) => x.getId() === id);
    }

    public findByMessage(m: IMsgFromClient): User | undefined {
        return this.users.find((x) => x.getId() === m.clientId && x.getToken() === m.token);
    }

    public count(): number {
        return this.users.length;
    }

    public makeUser(id: string, token: string) {
        const sendToClient = (msg: IMsgFromServer) => this.sendToClient(id, msg);
        return new User(id, token, sendToClient);
    }

    public sendToAll(msg: IMsgFromServer) {
        this.users.forEach((x) => x.send(msg));
    }

    public toClient() {
        return this.users.map((x) => x.toClient());
    }

    public findByName(name: string) {
        return this.users.find((x) => x.getName() === name);
    }

    public getUsersForRemove() {
        return this.users
            .filter((p) => p.secondsFromLastSeen() > 20 && !p.isPlaying());
    }
}
