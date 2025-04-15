#!/usr/bin/env node
// @ts-ignore

import terminalKit from 'terminal-kit';

import * as A from './actor.js';

const term = terminalKit.terminal;

const title = "CROSSY ROAD";

function run() {
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
    term.moveTo(titleX, titleY).bgBlack().white().bold(title);

    const mapWidth = Math.floor(screenWidth / 1.5);
    const mapHeight = Math.floor(screenHeight / 1.5);
    const frameX = Math.floor((screenWidth - mapWidth) / 2);
    const frameY = titleY + 2;
    const line_length: number = mapWidth - 2;
    const nb_line: number = mapHeight - 2;

    function drawFrame() {
        // Ligne du haut
        for (let x = 0; x < mapWidth; x++) {
            screenBuffer.put({
                x: frameX + x,
                y: frameY,
                attr: { bgColor: 'white', color: 'white' }
            }, ' ');
        }

        // Ligne du bas
        for (let x = 0; x < mapWidth; x++) {
            screenBuffer.put({
                x: frameX + x,
                y: frameY + mapHeight - 1,
                attr: { bgColor: 'white', color: 'white' }
            }, ' ');
        }

        // Colonnes gauche/droite
        for (let y = 1; y < mapHeight - 1; y++) {
            screenBuffer.put({
                x: frameX,
                y: frameY + y,
                attr: { bgColor: 'white', color: 'white' }
            }, ' ');
            screenBuffer.put({
                x: frameX + mapWidth - 1,
                y: frameY + y,
                attr: { bgColor: 'white', color: 'white' }
            }, ' ');
        }
    }





    drawFrame();

    term.grabInput(true);
    let count_void = 0;
    function tickLine(l: A.Line): A.Line {
        if (l.ordinate < 0) {
            count_void++;
            return A.init_line(line_length, nb_line - 1, 0, count_void % 2, false);
        }
        l.data.map((a: A.Actor) => a.mailbox.push({ "key": "move", "params": [A.down] }));
        l.data.map((a: A.Actor) => a.actions.tick(a));
        l.ordinate -= 1;
        return l;
    }


    // Animation : étoile aléatoire toutes les secondes

    let lines: A.Line[] = new Array(nb_line).fill(null).map((_, i: number) => A.init_line(line_length, i, 0, i % 2, [] as any));
    const tickInterval = setInterval(() => {
        lines = lines.map((l: A.Line) => tickLine(l));
	if (poulet.location.y < mapHeight-2){
	    poulet.mailbox.push({ "key": "move", "params": [A.down] });
	    poulet = poulet.update(poulet);}
	else
	    gameOver();
    }, 1000);

    /*
    term.on('key', (name: any) => {
        term.moveTo(frameX, frameY + mapHeight - 1);
        term.bgWhite().white(' '.repeat(mapWidth));
        term.styleReset();
    });
    */

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
	if (checkCollision()){
	    gameOver();}	
    }, 100);

    const pouletInterval = setInterval(() => {/*poulet = drawActor(poulet, poulet.location.x, poulet.location.y);*/ }, 10);

    function getDirection(actors: A.Actor[]): 'left' | 'right' | null {
        for (const actor of actors) {
            if (actor.name === A.Name.Car_R || actor.name === A.Name.Log_R || actor.name === A.Name.Water_R) return 'right';
            if (actor.name === A.Name.Car_L || actor.name === A.Name.Log_L || actor.name === A.Name.Water_L) return 'left';
        }
        return null; // aucune voiture trouvée
    }

    let obstacleProbability = 0.3;
    const carInterval = setInterval(() => {
        const roads = lines.filter((l) => l.type === 2);
        roads.map((r) => {
            const l = r.data.length;
            if (getDirection(r.data) === 'left') {
                r.data = r.data.slice(1);
                r.data.map((a) => a.mailbox.push({ "key": "move", "params": [A.left] }));
                if (Math.random() < obstacleProbability) {
                    obstacleProbability -= 0.1;
                    r.data.push(A.make_actor({ x: l - 1, y: r.ordinate }, A.Name.Car_L));
                }
                else {
                    r.data.push(A.make_actor({ x: l - 1, y: r.ordinate }, A.Name.Empty));
                    obstacleProbability += 0.1;
                }
            }
            else if (getDirection(r.data) === 'right') {
                r.data = r.data.slice(0, -1);
                r.data.map((a) => a.mailbox.push({ "key": "move", "params": [A.right] }));
                if (Math.random() < obstacleProbability) {
                    obstacleProbability -= 0.1;
                    r.data.unshift(A.make_actor({ x: 0, y: r.ordinate }, A.Name.Car_R));
                }
                else {
                    r.data.unshift(A.make_actor({ x: 0, y: r.ordinate }, A.Name.Empty));
                    obstacleProbability += 0.1;
                }
            }
            return r;
        });
    }, 200);

    const logInterval = setInterval(() => {
        const rivers = lines.filter((l) => l.type === 3);
        rivers.map((r) => {
            const l = r.data.length;
            if (getDirection(r.data) === 'left') {
                r.data = r.data.slice(1);
                r.data.map((a) => a.mailbox.push({ "key": "move", "params": [A.left] }));
                if (Math.random() < obstacleProbability) {
                    obstacleProbability -= 0.1;
                    r.data.push(A.make_actor({ x: l - 1, y: r.ordinate }, A.Name.Log_L));
                }
                else {
                    r.data.push(A.make_actor({ x: l - 1, y: r.ordinate }, A.Name.Water_L));
                    obstacleProbability += 0.1;
                }
            }
            else if (getDirection(r.data) === 'right') {
                r.data = r.data.slice(0, -1);
                r.data.map((a) => a.mailbox.push({ "key": "move", "params": [A.right] }));
                if (Math.random() < obstacleProbability) {
                    obstacleProbability -= 0.1;
                    r.data.unshift(A.make_actor({ x: 0, y: r.ordinate }, A.Name.Log_R));
                }
                else {
                    r.data.unshift(A.make_actor({ x: 0, y: r.ordinate }, A.Name.Water_R));
                    obstacleProbability += 0.1;
                }
            }
            return r;
        });
    }, 400);

    function isCollision(a: A.Actor): boolean {
        if (a.location.x === poulet.location.x && a.location.y === poulet.location.y) {
            term.moveTo(5, 6);
            console.log(`Collision ! (${a.name})`);
            if (a.name === A.Name.Log_R || a.name === A.Name.Log_L)
                return false;
            else if (a.name === A.Name.Car_R || a.name === A.Name.Car_L)
                return true;
            else if (a.name === A.Name.Water_R || a.name === A.Name.Water_L)
                return true;
            else return false;
        }
        return false;
    }

    function checkCollision(): boolean {
        let flag = false;
        lines.forEach((l: A.Line) => {
            l.data.forEach((a: A.Actor) => { if (isCollision(a)) flag = true; });
        });
        return flag;
    }

    function gameOver() {
        term("\x1B[?25h");
        clearInterval(tickInterval);
        clearInterval(pouletInterval);
        clearInterval(carInterval);
        clearInterval(updateInterval);
        term.grabInput(false);
        term.moveTo(frameX, frameY + mapHeight + 1);
        term.red.bold("💥 Game Over !\n");
        term.styleReset();
        process.exit(0);
    }

    term.on('key', (name: string) => {
        if (name === 'q' || name === 'CTRL_C') {
            clearInterval(tickInterval);
            clearInterval(updateInterval);
            clearInterval(carInterval);
            clearInterval(pouletInterval);
            term.grabInput(false);
            term.clear();
            term("\x1B[?25h");
            process.exit();
        }
        if (name === 'UP' && poulet.location.y > 1) poulet.mailbox.push({ "key": "move", "params": [A.up] });
        else if (name === 'DOWN' && poulet.location.y < nb_line) poulet.mailbox.push({ "key": "move", "params": [A.down] });
        else if (name === 'LEFT' && poulet.location.x > 0) poulet.mailbox.push({ "key": "move", "params": [A.left] });
        else if (name === 'RIGHT' && poulet.location.x < line_length - 2) poulet.mailbox.push({ "key": "move", "params": [A.right] });

    });
}

run();
