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
    mailbox: Message[];  // Ajout d'une boîte aux lettres
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

            // Traiter chaque message de la boîte aux lettres
            for (const message of actor.mailbox) {
                if (actor.actions[message.key]) {
                    // Si l'acteur possède une action correspondant à la clé du message
                    updatedActor = actor.actions[message.key](updatedActor, ...message.params);
                }
            }

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
        newActor.actions = { ...a.actions };  // Copier les actions
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
        newActor.actions = { ...a.actions };  // Copier les actions

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

/*

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

function tick_action(a: Actor): Actor {
    // Cette fonction peut être simplifiée puisqu'elle est remplacée par a.actions.tick
    return a.actions.tick(a);
}

function die(a: Actor): Actor {
    const new_actor: Actor = make_actor(a.location, a.name);
    const m: Message = {
        key: "die",
        params: []
    };
    new_actor.send(m);
    return new_actor;
}

*/

function init_chicken(x1: number, y1: number) {
    const pos: Position = {
        x: x1,
        y: y1
    };
    const actor: Actor = make_actor(pos, Name.Chicken);
    return actor;
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
    const random_line: number = Math.floor(Math.random() * 3) + 1;
    const l: Line = {
        ordinate: size_y,
        type: random_line,
        data: new Array(60).fill(0)
    };
    switch (l.type) {
        case 1:
            for (let i: number = 0; i < size_x; i++) {
                if (Math.random() > 0.5) {
                    const pos: Position = {
                        x: i,
                        y: l.ordinate
                    };
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
                const pos: Position = {
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
                const pos: Position = {
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
            console.log("Inexistant type of line");
            break;
    };
    return l;
}

export { right, left, up, down, Position, Message, Actor, Line, Name, LineType, make_actor, position_add, init_chicken, init_tree, init_water_right, init_water_left, init_log_right, init_log_left, init_car_right, init_car_left, init_line };

/*      EXEMPLES D'UTILISATION:

        // Créer un poulet
const chicken = init_chicken();

// Envoyer un message de déplacement vers la droite
chicken.send({
    key: "move",
    params: [right]
});

// Mettre à jour le poulet pour traiter le message
const updatedChicken = chicken.update(chicken);
// updatedChicken est maintenant à la position {x: 31, y: 5}


        // Le poulet rencontre un obstacle
chicken.send({
    key: "collide",
    params: []
});

// Mettre à jour le poulet pour traiter la collision
const deadChicken = chicken.update(chicken);
// Le message "die" devrait avoir été envoyé et le poulet devrait être mort


        // Dans une boucle de jeu, tous les acteurs reçoivent un "tick"
const allActors = [chicken, car1, car2, log1];

// Envoyer un tick à tous les acteurs
allActors.forEach(actor => {
    actor.send({
        key: "tick",
        params: []
    });
});

// Mettre à jour tous les acteurs
const updatedActors = allActors.map(actor => actor.update(actor));
// Les voitures et les bûches se seront déplacées automatiquement


        POUR WORLD:

// Dans world.ts
function processMessages() {
    // Si vous utilisez la console
    // Lire les messages de la console (simulé ici)
    
    // Ou si vous utilisez une file d'attente globale
    for (const { actorName, message } of globalMessageQueue) {
        if (message.key === "die") {
            // Arrêter la partie
            stopGame();
        }
        // Traiter d'autres types de messages...
    }
    
    // Vider la file après traitement
    globalMessageQueue = [];
}


        // Exemple de logique de détection de collision dans world.ts
function checkCollisions(chicken: Actor, otherActors: Actor[]) {
    for (const actor of otherActors) {
        if (isColliding(chicken, actor)) {
            // Envoyer le message collide UNIQUEMENT au poulet
            chicken.send({ key: "collide", params: [] });
            return; // Optionnel : arrêter après la première collision
        }
    }
}

*/