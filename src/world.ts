#!/usr/bin/env node
// @ts-ignore

import terminalKit from 'terminal-kit';

import * as A from './actor.js';

const term = terminalKit.terminal;

const title = "CROSSY ROAD";

function run() {
    term.hideCursor();
    term.fullscreen(true);
    term.clear();

    const screenBuffer = new terminalKit.ScreenBuffer({
        dst: term,
        width: term.width,
        height: term.height
    });


    const screenWidth = term.width;
    let screenHeight = term.height;
    if (screenHeight % 2 === 1)
        screenHeight = screenHeight - 1;

    if (!screenWidth || !screenHeight) {
        console.error("Could not determine terminal dimensions.");
        process.exit(1);
    }

    const titleX = Math.floor((screenWidth - title.length) / 2);
    const titleY = 6;
    screenBuffer.put({ x: titleX, y: titleY, attr: { color: "white", bgcolor: "black", bold: true } }, title);

    const mapWidth = Math.floor(screenWidth / 1.5);
    const mapHeight = Math.floor(screenHeight / 1.5);
    const frameX = Math.floor((screenWidth - mapWidth) / 2);
    const frameY = titleY + 2;
    const line_length: number = mapWidth - 2;
    const nb_line: number = mapHeight - 2;
    let nb_ligne = 0;

    function drawFrame() {
        // Generate positions for all borders
        const topBorder = Array.from({ length: mapWidth })
            .map((_, x) => ({
                x: frameX + x,
                y: frameY + 1,
                attr: { bgColor: 'white', color: 'white' }
            }));

        const bottomBorder = Array.from({ length: mapWidth })
            .map((_, x) => ({
                x: frameX + x,
                y: frameY + mapHeight - 1,
                attr: { bgColor: 'white', color: 'white' }
            }));

        const sideBorders = Array.from({ length: mapHeight - 2 })
            .flatMap((_, y) => [
                {
                    x: frameX,
                    y: frameY + y + 1,
                    attr: { bgColor: 'white', color: 'white' }
                },
                {
                    x: frameX + mapWidth - 1,
                    y: frameY + y + 1,
                    attr: { bgColor: 'white', color: 'white' }
                }
            ]);

        // Combine all border positions and draw them
        [...topBorder, ...bottomBorder, ...sideBorders]
            .forEach(position => screenBuffer.put(position, ' '));
    }

    drawFrame();

    term.grabInput(true);
    let count_void = 0;
    function tickLine(l: A.Line): A.Line {
        if (l.ordinate < 0) {
            count_void++;
            return A.init_line(line_length, nb_line - 1, false, nb_line);
        }
        l.data.map((a: A.Actor) => a.mailbox.push({ "key": "move", "params": [A.down] }));
        l.ordinate -= 1;
        return l;
    }


    // Animation : étoile aléatoire toutes les secondes

    let lines: A.Line[] = new Array(nb_line).fill(null).map((_, i: number) => A.init_line(line_length, i, true, nb_line));
    const tickInterval = setInterval(() => {
        lines = lines.map((l: A.Line) => tickLine(l));
        if (poulet.location.y < mapHeight - 2) {
            poulet.mailbox.push({ "key": "move", "params": [A.down] });
            poulet = poulet.update(poulet);
        }
        else
            gameOver();
    }, 1000);



    // Remplacer la ligne de posInit par
    const posInit: A.Position = {
        x: Math.floor(line_length / 2), // Utiliser line_length au lieu de mapWidth
        y: Math.floor(nb_line / 2)      // Utiliser nb_line au lieu de mapHeight
    };
    let poulet: A.Actor = A.make_actor(posInit, A.Name.Chicken);

    function drawActor(a: A.Actor, x: number, y: number): A.Actor {
        if (y > nb_line) return a.update(a);

        const screenX = frameX + x + 1;
        const screenY = frameY + y;

        const attr = { color: 'white', bgColor: 'black' };
        let char = ' ';

        if (a.name === A.Name.Tree) attr.bgColor = 'green';
        else if ([A.Name.Water_R, A.Name.Water_L].includes(a.name)) attr.bgColor = 'cyan';
        else if ([A.Name.Log_R, A.Name.Log_L].includes(a.name)) attr.bgColor = 94 as any;
        else if ([A.Name.Car_R, A.Name.Car_L].includes(a.name)) attr.bgColor = 'grey';
        else if (a.name === A.Name.Chicken) char = '🐔';

        screenBuffer.put({ x: screenX, y: screenY, attr }, char);
        return a.update(a);
    }


    function drawLine(l: A.Line): A.Line {
        l.data = l.data.map((a: A.Actor) => drawActor(a, a.location.x, nb_line - l.ordinate + 1));
        return l;
    }

    const updateInterval = setInterval(() => {
        lines = lines.map((l: A.Line) => drawLine(l));
        poulet = drawActor(poulet, poulet.location.x, poulet.location.y);
        screenBuffer.draw({ delta: true });
    }, 10);

    const pouletInterval = setInterval(() => {/*poulet = drawActor(poulet, poulet.location.x, poulet.location.y);*/ }, 10);

    function getDirection(actors: A.Actor[]): 'left' | 'right' | null {
        for (const actor of actors) {
            if (actor.name === A.Name.Car_R || actor.name === A.Name.Log_R || actor.name === A.Name.Water_R) return 'right';
            if (actor.name === A.Name.Car_L || actor.name === A.Name.Log_L || actor.name === A.Name.Water_L) return 'left';
        }
        return null; // aucune voiture trouvée
    }

    const carInterval = setInterval(() => {
        const roads = lines.filter((l) => l.type === A.LineType.Road);
        roads.map((r) => {
            const l = r.data.length;
            if (getDirection(r.data) === 'left') {
                r.data = r.data.slice(1);
                r.data.map((a) => a.mailbox.push({ "key": "move", "params": [A.left] }));
                if (r.pattern[r.patternIndex] === 1) {
                    r.data.push(A.make_actor({ x: l - 1, y: r.ordinate }, A.Name.Car_L));
                }
                else {
                    r.data.push(A.make_actor({ x: l - 1, y: r.ordinate }, A.Name.Empty));
                }
            }
            else if (getDirection(r.data) === 'right') {
                r.data = r.data.slice(0, -1);
                r.data.map((a) => a.mailbox.push({ "key": "move", "params": [A.right] }));
                if (r.pattern[r.patternIndex] === 1) {
                    r.data.unshift(A.make_actor({ x: 0, y: r.ordinate }, A.Name.Car_R));
                }
                else {
                    r.data.unshift(A.make_actor({ x: 0, y: r.ordinate }, A.Name.Empty));
                }
            }
            r.patternIndex += 1;
            return r;
        });
    }, 200);
    const logInterval = setInterval(() => {
        const rivers = lines.filter((l) => l.type === 3);
        rivers.map((r) => {
            r.data.forEach((a) => {
                const realY_log = nb_line - r.ordinate + 1;
                if (a.location.x === poulet.location.x && realY_log === poulet.location.y && a.name === A.Name.Log_R)
                    poulet.mailbox.push({ "key": "move", "params": [A.right] });
                else if (a.location.x === poulet.location.x && realY_log === poulet.location.y && a.name === A.Name.Log_L)
                    poulet.mailbox.push({ "key": "move", "params": [A.left] });

            });
            const l = r.data.length;
            if (getDirection(r.data) === 'left') {
                r.data = r.data.slice(1);
                r.data.map((a) => a.mailbox.push({ "key": "move", "params": [A.left] }));
                if (r.pattern[r.patternIndex] === 1) {
                    r.data.push(A.make_actor({ x: l - 1, y: r.ordinate }, A.Name.Log_L));
                }
                else {
                    r.data.push(A.make_actor({ x: l - 1, y: r.ordinate }, A.Name.Water_L));
                }
            }
            else if (getDirection(r.data) === 'right') {
                r.data = r.data.slice(0, -1);
                r.data.map((a) => a.mailbox.push({ "key": "move", "params": [A.right] }));
                if (r.pattern[r.patternIndex] === 1) {
                    r.data.unshift(A.make_actor({ x: 0, y: r.ordinate }, A.Name.Log_R));
                }
                else {
                    r.data.unshift(A.make_actor({ x: 0, y: r.ordinate }, A.Name.Water_R));
                }
            }
            r.patternIndex += 1;
            return r;
        });
    }, 400);

    function isCollision(a: A.Actor): boolean {
        // Trouver la ligne contenant l'acteur
        const actorLine = lines.find(line =>
            line.data.includes(a)
        );

        if (!actorLine) return false;

        // Calculer la coordonnée Y réelle (même transformation que pour l'affichage)
        const realY = nb_line - actorLine.ordinate + 1;

        // Vérifie si les positions correspondent (avec coordonnée Y transformée)
        if (a.location.x !== poulet.location.x || realY !== poulet.location.y) {
            return false;
        }


        const safeActors = [A.Name.Log_R, A.Name.Log_L];
        const dangerousActors = [
            A.Name.Car_R, A.Name.Car_L,
            A.Name.Water_R, A.Name.Water_L,
            A.Name.Tree
        ];

        return dangerousActors.includes(a.name);
    }

    function checkCollision(): boolean {
        return lines.some(line =>
            line.data.some(actor => isCollision(actor))
        );
    }

    const colision = setInterval(() => {
        {
            if (checkCollision()) {
                gameOver();
            }
        }
        screenBuffer.put({ x: frameY + mapHeight, y: mapWidth / 3, attr: { color: "white", bgcolor: "black" } }, "SCORE : " + nb_ligne);
    }, 1);

    function gameOver() {
        term("\x1B[?25h");
        clearInterval(tickInterval);
        clearInterval(pouletInterval);
        clearInterval(carInterval);
        clearInterval(updateInterval);
        clearInterval(logInterval);
        clearInterval(colision);
        term.grabInput(false);

        term.clear();
        screenBuffer.clear();

        const gameOverX = Math.floor(term.width / 2) - 5;
        const gameOverY = Math.floor(term.height / 2);
        screenBuffer.put({ x: gameOverX, y: gameOverY, attr: { color: 'white', bgColor: 'black' } }, "💥 GAME OVER 💥\n");

        const questionX = Math.floor(term.width / 2) - 10;
        const questionY = gameOverY + 2;
        screenBuffer.put({ x: questionX, y: questionY, attr: { color: 'white', bgColor: 'black' } }, "Voulez-vous continuer ?");

        const buttonX = Math.floor(term.width / 2) - 6;
        const buttonY = questionY + 2;

        screenBuffer.put({ x: buttonX, y: buttonY, attr: { color: 'green', bgColor: 'black' } }, "OUI (y)");

        screenBuffer.put({ x: buttonX + 10, y: buttonY, attr: { color: 'red', bgColor: 'black' } }, "NON (n)");
        screenBuffer.draw();

        term.grabInput(true);
        term.on('key', (name: string) => {
            if (name === 'y' || name === 'ENTER' || name === 'o') {
                term.grabInput(true);
                term.clear();
                term.moveTo(1, 1);
                screenBuffer.clear();
                run();
            } else if (name === 'n' || name === 'q' || name === 'CTRL_C') {
                term.grabInput(false);
                term.styleReset();
                term.clear();
                term.moveTo(1, 1);
                term("\x1B[?25h");
                process.exit(0);
            }
        });
    }

    term.on('key', (name: string) => {
        if (name === 'q' || name === 'CTRL_C') {
            term.styleReset();
            term.clear();
            term("\x1B[?25h");
            clearInterval(tickInterval);
            clearInterval(updateInterval);
            clearInterval(carInterval);
            clearInterval(pouletInterval);
            clearInterval(logInterval);
            clearInterval(colision);


            term.grabInput(false);
            process.exit(0);
        }
        if (name === 'UP' && poulet.location.y > 2) {
            poulet.mailbox.push({ "key": "move", "params": [A.up] });
            nb_ligne++;
            if (poulet.location.y < nb_line / 2) {
                lines = lines.map((l: A.Line) => tickLine(l));
                if (poulet.location.y < mapHeight - 2) {
                    poulet.mailbox.push({ "key": "move", "params": [A.down] });
                    poulet = poulet.update(poulet);
                }
                else
                    gameOver();
            }
        }
        else if (name === 'DOWN' && poulet.location.y < nb_line) poulet.mailbox.push({ "key": "move", "params": [A.down] });
        else if (name === 'LEFT' && poulet.location.x > 0) poulet.mailbox.push({ "key": "move", "params": [A.left] });
        else if (name === 'RIGHT' && poulet.location.x < line_length - 2) poulet.mailbox.push({ "key": "move", "params": [A.right] });

    });
}

run();
