import {ClientMessageFactory} from "../from-client/ClientMessageFactory";
import {Game} from "../Game";
import {Player} from "../Player";
import {Room} from "../Room";
import {RoomManager} from "../RoomManager";
import {UserManager} from "../UserManager";

const dictMaker = {generic: Room};
const genericMaker = {generic: Player};

test("game creation", () => {
    const playerManager = new UserManager();
    const roomsManager = new RoomManager(dictMaker, genericMaker);
    const factory = new ClientMessageFactory();
    const game = new Game(playerManager, roomsManager, factory, "xxx");
    game.findOrCreate("pepe");
    expect(playerManager.count()).toBe(1);
    game.findOrCreate("pepe");
    expect(playerManager.count()).toBe(1);
    game.findOrCreate("jorge");
    expect(playerManager.count()).toBe(2);
});

test("game auth messages", () => {
    const playerManager = new UserManager();
    const roomsManager = new RoomManager(dictMaker, genericMaker);
    const factory = new ClientMessageFactory();
    const game = new Game(playerManager, roomsManager, factory, "xxx");

    const pepe = game.findOrCreate("pepe");

    expect(game.exec({
        clientId: pepe.getId(),
        gameType: "generic",
        maxPlayers: 2,
        token: pepe.getToken(),
        type: "createRoom",
    })).toBe(true);

    expect(game.exec({
        clientId: pepe.getId(),
        gameType: "generic",
        token: "jos",
        type: "createRoom",
    })).toBe(false);

});

test("create room length", () => {
    const playerManager = new UserManager();
    const roomsManager = new RoomManager(dictMaker, genericMaker);
    const factory = new ClientMessageFactory();
    const game = new Game(playerManager, roomsManager, factory, "xxx");

    const pepe = game.findOrCreate("pepe");
    const jorge = game.findOrCreate("jorge");

    expect(game.exec({
        clientId: pepe.getId(),
        gameType: "generic",
        maxPlayers: 2,
        token: pepe.getToken(),
        type: "createRoom",
    })).toBe(true);

    expect(game.exec({
        clientId: jorge.getId(),
        gameType: "generic",
        maxPlayers: 2,
        token: jorge.getToken(),
        type: "createRoom",
    })).toBe(true);

    expect(roomsManager.count()).toBe(2);
});

test("join room then start game", () => {
    const sentToClient = jest.fn();
    const playerManager = new UserManager(sentToClient);
    const roomsManager = new RoomManager(dictMaker, genericMaker);
    const factory = new ClientMessageFactory();
    const game = new Game(playerManager, roomsManager, factory, "xxx");

    const pepe = game.findOrCreate("pepe");
    const jorge = game.findOrCreate("jorge");

    expect(game.exec({
        clientId: pepe.getId(),
        gameType: "generic",
        maxPlayers: 2,
        token: pepe.getToken(),
        type: "createRoom",
    })).toBe(true);

    expect(game.exec({
        clientId: jorge.getId(),
        gameType: "generic",
        maxPlayers: 2,
        token: jorge.getToken(),
        type: "joinRoom",
    })).toBe(true);

    expect(roomsManager.count()).toBe(1);
    expect(sentToClient).toHaveBeenCalledTimes(3);
    expect(game.exec({
        clientId: jorge.getId(),
        maxPlayers: 2,
        roomId: roomsManager.findByPlayer(pepe)!.getId(),
        token: jorge.getToken(),
        type: "joinRoom",
    })).toBe(true);

    expect(sentToClient).toHaveBeenCalledWith(jorge.getId(), {type: "startGame"});
});
