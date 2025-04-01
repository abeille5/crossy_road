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


function init_line(size_x: number, size_y: number) {
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