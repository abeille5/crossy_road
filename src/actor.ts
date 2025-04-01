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
    y: -1
};

const down: Position = {
    x: 0,
    y: 1
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
    mailbox: Message[];
    send: (m: Message) => void;
    actions: {
        [key: string]: (a: Actor, ...rest: any) => Actor;
    }
    update: (a: Actor) => Actor;
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
        mailbox: [],  // Boîte aux lettres vide au départ
        send: (m: Message): void => {
            // console.log(`Actor ${n} sent message: ${m.key}`, m.params);
        },
        actions: {},
        update: (actor: Actor): Actor => {
            // Créer un nouvel acteur avec les mêmes propriétés mais une boîte vide
            let updatedActor = make_actor(actor.location, actor.name);

            // Copier les actions
            updatedActor.actions = { ...actor.actions };

            const valid_actions = actor.mailbox.filter((msg) => Boolean(actor.actions[msg.key]));
            updatedActor = valid_actions.reduce((updatedActor, msg) => actor.actions[msg.key](updatedActor, ...msg.params), updatedActor);

            // Vider la boîte aux lettres
            updatedActor.mailbox = [];

            // Retourner l'acteur mis à jour
            return updatedActor;
        },
        name: n,
    };

    // Définir les actions standard
    a.actions.move = (a: Actor, dx: Position): Actor => {
        const newActor = make_actor(position_add(a.location, dx), n);
        newActor.actions = { ...a.actions };
        return newActor;
    };

    a.actions.collide = (a: Actor): Actor => {
        const new_actor = make_actor(a.location, a.name);
        new_actor.actions = { ...a.actions };
        new_actor.send({ key: "die", params: [] });
        return new_actor;
    };

    a.actions.tick = (a: Actor): Actor => {
        // Implémenter le comportement automatique selon le type d'acteur
        const newActor = make_actor(a.location, a.name);
        newActor.actions = { ...a.actions };

        switch (a.name) {
            case Name.Water_R:
                return newActor.actions.move(newActor, right);
            case Name.Water_L:
                return newActor.actions.move(newActor, left);
            case Name.Log_R:
                return newActor.actions.move(newActor, right);
            case Name.Log_L:
                return newActor.actions.move(newActor, left);
            case Name.Car_R:
                return newActor.actions.move(newActor, right);
            case Name.Car_L:
                return newActor.actions.move(newActor, left);
        }

        return newActor;
    };

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


function init_line(size_x: number, size_y: number): Line {
    const random_line: number = Math.floor(Math.random() * 3) + 1;
    const l: Line = {
        ordinate: size_y,
        type: random_line,
        data: new Array(60).fill(0)
    };
    switch (l.type) {
        case 1:
            l.data = Array.from({ length: size_x }, (_, i) =>
                Math.random() > 0.5 ? make_actor({ x: i, y: l.ordinate }, Name.Tree) : l.data[i]
            );
            break;
        case 2:
            let left1: number = 1;
            if (Math.random() > 0.5) {
                left1 = 0;
            }

            l.data = Array.from({ length: size_x }, (_, i) =>
                (Math.random() > 0.5)
                    ? (left1 ? make_actor({ x: i, y: l.ordinate }, Name.Car_L) : make_actor({ x: i, y: l.ordinate }, Name.Car_R))
                    : l.data[i]
            );
            break;
        case 3:
            let left2 = 1;
            if (Math.random() > 0.5) {
                left2 = 0;
            }

            l.data = Array.from({ length: size_x }, (_, i) =>
                (Math.random() > 0.5)
                    ? (left2 ? make_actor({ x: i, y: l.ordinate }, Name.Water_L) : make_actor({ x: i, y: l.ordinate }, Name.Water_R))
                    : (left2 ? make_actor({ x: i, y: l.ordinate }, Name.Log_L) : make_actor({ x: i, y: l.ordinate }, Name.Log_R))
            );
            break;
        default:
            console.log("Inexistant type of line");
            break;
    };
    return l;
}

export {
    right, left, up, down, Position, Message, Actor, Line, Name, LineType, make_actor, position_add, init_line
};