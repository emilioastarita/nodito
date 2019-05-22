import {User} from "../User";
import {UserManager} from "../UserManager";

test("user creation", () => {
    const a = new User("x", "");
    expect(a.getId()).toBe("x");
});

test("user find", () => {
    const c = new UserManager();
    const a = new User("x", "");
    expect(c.find("x")).toBe(undefined);
    c.add(a);
    expect(c.find("x")).toBe(a);
});
