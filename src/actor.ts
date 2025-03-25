type Position = {
    x: number;
    y: number;
}

type Message = {
    key: string;
    params: any[];
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
}

// Return an actor with a defined position and an initialized action move
function make_actor(p: Position, n: Name): Actor {
    let a: Actor = {
        location: p,
        send: (m: Message) => {
            console.log(`${m.key}`, m.params);
        },
        actions: {},
        update: (actor: Actor): Actor => {
            return { ...actor }
        },
        name: n,
    }
    let move = (a: Actor, dx: Position): Actor => make_actor(position_add(a.location, dx), n);
    let tick = (a: Actor): Actor => tick_action(a);
    a.actions.move = move;
    a.actions.tick = tick;
    return a;
}

// Update the current position to a new one with dx changement.
function position_add(current_position: Position, dx: Position): Position {
    let pos: Position = {
        x: current_position.x + dx.x,
        y: current_position.y + dx.y
    }
    return pos;
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

function tick_action(a: Actor): Actor {
    let new_actor: Actor = make_actor(a.location, a.name)
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

function init_tree(pos: Position) {
    let new_actor: Actor = make_actor(pos, 2);
    return new_actor;
}

function init_water_right(pos: Position) {
    let new_actor: Actor = make_actor(pos, 3);
    return new_actor;
}

function init_water_left(pos: Position) {
    let new_actor: Actor = make_actor(pos, 4);
    return new_actor;
}

function init_log_right(pos: Position) {
    let new_actor: Actor = make_actor(pos, 5);
    return new_actor;
}

function init_log_left(pos: Position) {
    let new_actor: Actor = make_actor(pos, 6);
    return new_actor;
}

function init_car_right(pos: Position) {
    let new_actor: Actor = make_actor(pos, 7);
    return new_actor;
}

function init_car_left(pos: Position) {
    let new_actor: Actor = make_actor(pos, 8);
    return new_actor;
}
