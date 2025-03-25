const right: Position = {
    x: 1,
    y: 0
};
const left: Position = {
    x: -1,
    y: 0
};

const up: Position = {
    x: 0,
    y: 1
};

const down: Position = {
    x: 0,
    y: -1
};

type Position = {
    x: number;
    y: number;
}

type Message = {
    key: string;
    params: any[];
}

type Line = {
    ordinate: number;
    type: LineType;
    data: Actor[];
}

type Actor = {
    location: Position;
    send: (m: Message) => void;
    actions: {
        [key: string]: (a: Actor, ...rest: any) => Actor;
    }
    update: (a: Actor, m: Message) => Actor;
    name: Name;
}

enum Name {
    Chicken = 1,
    Tree,
    Water_R,
    Water_L,
    Log_R,
    Log_L,
    Car_R,
    Car_L,
};

enum LineType {
    Nature = 1,
    Road,
    River
};

// Return an actor with a defined position and an initialized action move
function make_actor(p: Position, n: Name): Actor {
    const a: Actor = {
        location: p,
        send: (m: Message) => {
            console.log(`${m.key}`, m.params);
        },
        actions: {},
        update: (actor: Actor): Actor => {
            return { ...actor };
        },
        name: n,
    };
    const move = (a: Actor, dx: Position): Actor => make_actor(position_add(a.location, dx), n);
    const tick = (a: Actor): Actor => tick_action(a);
    a.actions.move = move;
    a.actions.tick = tick;
    return a;
}

// Update the current position to a new one with dx changement.
function position_add(current_position: Position, dx: Position): Position {
    const pos: Position = {
        x: current_position.x + dx.x,
        y: current_position.y + dx.y
    };
    return pos;
}


function tick_action(a: Actor): Actor {
    const new_actor: Actor = make_actor(a.location, a.name);
    switch (a.name) {
        case 1:
            break;
        case 2:
            break;
        case 3:
            new_actor.actions.move(new_actor, right);
            break;
        case 4:
            new_actor.actions.move(new_actor, left);
            break;
        case 5:
            new_actor.actions.move(new_actor, right);
            break;
        case 6:
            new_actor.actions.move(new_actor, left);
            break;
        case 7:
            new_actor.actions.move(new_actor, right);
            break;
        case 8:
            new_actor.actions.move(new_actor, left);
            break;
        default:
            console.log("Inexistant name of actor\n");
            break;
    }
    return a;
}

function init_chicken() {
    let pos: Position = {
        x: 30,
        y: 5
    };
    let actor: Actor = make_actor(pos, 1);
    let collide = (a: Actor): Actor => die(a);
    actor.actions.collide = collide;
    const m: Message = {
        key: "New game has started",
        params: []
    };
    return actor;
}


function die(a: Actor): Actor {
    let new_actor: Actor = make_actor(a.location, a.name);
    const m: Message = {
        key: "The chicken hit something or drown",
        params: []
    }
    new_actor.send(m);
    return new_actor;
}

function init_tree(pos: Position) {
    const new_actor: Actor = make_actor(pos, 2);
    return new_actor;
}

function init_water_right(pos: Position) {
    const new_actor: Actor = make_actor(pos, 3);
    return new_actor;
}

function init_water_left(pos: Position) {
    const new_actor: Actor = make_actor(pos, 4);
    return new_actor;
}

function init_log_right(pos: Position) {
    const new_actor: Actor = make_actor(pos, 5);
    return new_actor;
}

function init_log_left(pos: Position) {
    const new_actor: Actor = make_actor(pos, 6);
    return new_actor;
}

function init_car_right(pos: Position) {
    const new_actor: Actor = make_actor(pos, 7);
    return new_actor;
}

function init_car_left(pos: Position) {
    const new_actor: Actor = make_actor(pos, 8);
    return new_actor;
}

function init_line(size_x: number, size_y: number) {
    let random_line: number = Math.floor(Math.random() * 3) + 1;
    let l: Line = {
        ordinate: size_y,
        type: random_line,
        data: new Array(60).fill(0)
    }
    switch (l.type) {
        case 1:
            for (let i: number = 0; i < size_x; i++) {
                if (Math.random() > 0.5) {
                    let pos: Position = {
                        x: i,
                        y: l.ordinate
                    }
                    l.data[i] = init_tree(pos);
                }
            }
            break;
        case 2:
            let left1: number = 1;
            if (Math.random() > 0.5) {
                left1 = 0;
            }
            for (let i: number = 0; i < size_x; i++) {
                let pos: Position = {
                    x: i,
                    y: l.ordinate
                };
                if (Math.random() > 0.5) {
                    if (left1) {
                        l.data[i] = init_car_left(pos);
                    }
                    else {
                        l.data[i] = init_car_right(pos);
                    }
                }
            }
            break;
        case 3:
            let left2 = 1;
            if (Math.random() > 0.5) {
                left2 = 0;
            }
            for (let i: number = 0; i < size_x; i++) {
                let pos: Position = {
                    x: i,
                    y: l.ordinate
                };
                if (Math.random() > 0.5) {
                    if (left2) {
                        l.data[i] = init_water_left(pos);
                    }
                    else {
                        l.data[i] = init_water_right(pos);
                    }
                }
                else {
                    if (left2) {
                        l.data[i] = init_log_left(pos);
                    }
                    else {
                        l.data[i] = init_log_right(pos);
                    }
                }
            }
            break;
        default:
            console.log("Inexistant type of line")
            break;
    };
    return l;
}
