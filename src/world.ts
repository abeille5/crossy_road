#!/usr/bin/env node
// @ts-ignore

import terminalKit from 'terminal-kit';

import * as A from './actor.js';

const term = terminalKit.terminal;

const title = "CROSSY ROAD";

type World = {
    score: number;
    lines: A.Line[];
    poulet: A.Actor;
    level: number;
}

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

        [...topBorder, ...bottomBorder, ...sideBorders]
            .forEach(position => screenBuffer.put(position, ' '));
    }

    drawFrame();

    function make_world(score:number, actors:A.Line[], poulet:A.Actor) : World {
	const world: World = {
            score: score,
            lines: actors,
            poulet: poulet,
            level: 1
	};
	return world;
    }

    function tick_world(world:World) : World {
	if (world.poulet.location.y < mapHeight - 2){
            world.poulet.mailbox.push({ "key": "move", "params": [A.down] });
	}
	else {
            gameOver();
	}
	return make_world(world.score + 1, world.lines.map((l: A.Line) => tickLine(l)), world.poulet.update(world.poulet));
    }

    function update_world(world:World) : World {
	const new_world = make_world(world.score, world.lines.map((l: A.Line) => drawLine(l)), drawActor(world.poulet, world.poulet.location.x, world.poulet.location.y));
	screenBuffer.draw({ delta: true });
	term.moveTo(5, 10);
	console.log(`Score = ${w.score}`);
	return new_world;
    }

    
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

    const lines: A.Line[] = new Array(nb_line).fill(null).map((_, i: number) => A.init_line(line_length, i, true, nb_line));
    const posInit: A.Position = {
        x: Math.floor(line_length / 2), // Utiliser line_length au lieu de mapWidth
        y: Math.floor(nb_line / 2)      // Utiliser nb_line au lieu de mapHeight
    };
    const poulet: A.Actor = A.make_actor(posInit, A.Name.Chicken);

    let w = make_world(0, lines, poulet);
    
    const tickInterval = setInterval(() => {
        w = tick_world(w);
    }, 1000);

    const updateInterval = setInterval(() => {
        w = update_world(w);
    }, 10);

    
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

    
    function getDirection(actors: A.Actor[]): 'left' | 'right' | null {
        for (const actor of actors) {
            if (actor.name === A.Name.Car_R || actor.name === A.Name.Log_R || actor.name === A.Name.Water_R) return 'right';
            if (actor.name === A.Name.Car_L || actor.name === A.Name.Log_L || actor.name === A.Name.Water_L) return 'left';
        }
        return null; // aucune voiture trouvée
    }

    const carInterval = setInterval(() => {
        const roads = w.lines.filter((l) => l.type === A.LineType.Road);
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
        const rivers = w.lines.filter((l) => l.type === 3);
        rivers.map((r) => {
            r.data.forEach((a) => {
                const realY_log = nb_line - r.ordinate + 1;
                if (a.location.x === w.poulet.location.x && realY_log === w.poulet.location.y && a.name === A.Name.Log_R)
                    w.poulet.mailbox.push({ "key": "move", "params": [A.right] });
                else if (a.location.x === w.poulet.location.x && realY_log === w.poulet.location.y && a.name === A.Name.Log_L)
                    w.poulet.mailbox.push({ "key": "move", "params": [A.left] });

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
        const actorLine = w.lines.find(line =>
            line.data.includes(a)
        );

        if (!actorLine) return false;

        // Calculer la coordonnée Y réelle (même transformation que pour l'affichage)
        const realY = nb_line - actorLine.ordinate + 1;

        // Vérifie si les positions correspondent (avec coordonnée Y transformée)
        if (a.location.x !== w.poulet.location.x || realY !== w.poulet.location.y) {
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

    function checkCollision(world:World): boolean {
        return world.lines.some((line:A.Line) =>
            line.data.some((actor:A.Actor) => isCollision(actor))
        );
    }

    const colision = setInterval(() => {
	{
            if (checkCollision(w)) {
                gameOver();
            }
	}
	screenBuffer.put({ x: frameY + mapHeight, y: mapWidth / 3, attr: {color: "white", bgcolor: "black" }},"SCORE : " +nb_ligne);
	}, 50);

    function gameOver() {
        term("\x1B[?25h");
        clearInterval(tickInterval);
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
            clearInterval(logInterval);
            clearInterval(colision);


            term.grabInput(false);
            process.exit(0);
        }
        if (name === 'UP' && w.poulet.location.y > 2) {
            w.poulet.mailbox.push({ "key": "move", "params": [A.up] });
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
        else if (name === 'DOWN' && w.poulet.location.y < nb_line) w.poulet.mailbox.push({ "key": "move", "params": [A.down] });
        else if (name === 'LEFT' && w.poulet.location.x > 0) w.poulet.mailbox.push({ "key": "move", "params": [A.left] });
        else if (name === 'RIGHT' && w.poulet.location.x < line_length - 2) w.poulet.mailbox.push({ "key": "move", "params": [A.right] });
    });
}

run();
