#!/usr/bin/env node
// @ts-ignore

import terminalKit from 'terminal-kit';

import * as A from './actor.js';

const term = terminalKit.terminal;

const title = "CROSSY ROAD";

function run() {
    term.fullscreen(true);
    term.clear();
    const screenWidth = term.width;
    const screenHeight = term.height;

    if (!screenWidth || !screenHeight) {
        console.error("Could not determine terminal dimensions.");
        process.exit(1);
    }

    const titleX = Math.floor((screenWidth - title.length) / 2);
    const titleY = 2;
    term.moveTo(titleX, titleY).bgBlack().white().bold(title);

    const mapWidth = Math.floor(screenWidth / 1.5);
    const mapHeight = Math.floor(screenHeight / 1.5);
    const frameX = Math.floor((screenWidth - mapWidth) / 2);
    const frameY = titleY + 2;
    const line_length: number = mapWidth - 2;
    const nb_line: number = mapHeight - 2;

    function drawFrame() {
        
        term.moveTo(frameX, frameY);
        term.bgWhite().white(' '.repeat(mapWidth));
        term.styleReset();

        for (let y = 1; y < mapHeight - 1; y++) {
            term.moveTo(frameX, frameY + y);
            term.bgWhite().white(' ');
            term.bgBlack().white(' '.repeat(mapWidth - 2));
            term.bgWhite().white(' ');
            term.styleReset();
        }
    }

    term.moveTo(frameX, frameY + mapHeight - 1);
    term.bgWhite().white(' '.repeat(mapWidth));
    term.styleReset();
    term.grabInput(true);

    drawFrame();
    
    function tickLine(l : A.Line): A.Line {
    if (l.ordinate < 0)
        return A.init_line(line_length, nb_line - 1, 0, []);
    l.data.map((a : A.Actor) => a.mailbox.push({"key":"move", "params":[A.down]}));
    l.data.map((a : A.Actor) => a.actions.tick(a));
    l.ordinate -= 1;
    return l;
    }
	
    
    let lines:A.Line[] = new Array(nb_line).fill(null).map((_, i:number) => A.init_line(line_length, i, 0, []));
    const tickInterval = setInterval(() => {
        lines = lines.map((l: A.Line) => tickLine(l));
        poulet = poulet.actions.tick(poulet);
    }, 500);

    term.on('key', (name: any) => {
        term.moveTo(frameX, frameY + mapHeight - 1);
        term.bgWhite().white(' '.repeat(mapWidth));
        term.styleReset();
    });

    const posInit: A.Position = { x: frameX + Math.floor(mapWidth / 2) - 2, y: frameY + Math.floor(mapHeight / 2) };
    let poulet: A.Actor = A.make_actor(posInit, A.Name.Chicken);

    

    function drawActor(a: A.Actor, x: number, y: number): A.Actor {
        if (y > nb_line)
            return a.update(a);
        if (a.name !== A.Name.Chicken && (x === poulet.location.x && y === poulet.location.y)) {
            term.moveTo(5, 5);
            console.log(`Poulet ! (${a.name})`);
            return a.update(a);
        }
        term.moveTo(frameX + x + 1, frameY + y);
        if (a.name === A.Name.Tree)
            term.bgGreen().white(' ');
        else if (a.name === A.Name.Water_R || a.name === A.Name.Water_L)
            term.bgBlue().white(' ');
        else if (a.name === A.Name.Log_R || a.name === A.Name.Log_L)
            term.bgRed().white(' ');
        else if (a.name === A.Name.Car_R || a.name === A.Name.Car_L)
            term.bgGrey().white(' ');
        else if (a.name === A.Name.Chicken) {
            term.bgBlack().white('🐔');
            term.hideCursor();
        }
        else
            term.bgBlack().black(' ');
        term.styleReset();
        return a.update(a);
    }

    function drawLine(l: A.Line): A.Line {
        l.data = l.data.map((a: A.Actor) => drawActor(a, a.location.x, nb_line - l.ordinate));
        return l;
    }

    const updateInterval = setInterval(() => {
        lines = lines.map((l: A.Line) => drawLine(l));
        poulet = drawActor(poulet, poulet.location.x, poulet.location.y);
    }, 300);

    const pouletInterval = setInterval(() => { poulet = drawActor(poulet, poulet.location.x, poulet.location.y); }, 10);

    const obstacles: boolean[][] = [];




    function checkCollision(): boolean {
        const mapY = poulet.location.y - frameY - 1;
        const mapX = poulet.location.x - frameX - 1;

        if (
            mapY >= 0 &&
            mapY < obstacles.length &&
            mapX >= 0 &&
            mapX < mapWidth - 2 &&
            obstacles[mapY][mapX]
        ) {
            return true;
        }
        return false;
    }

    function gameOver() {
        term("\x1B[?25h");
        clearInterval(tickInterval);
        term.grabInput(false);
        term.moveTo(frameX, frameY + mapHeight + 1);
        term.red.bold("💥 Game Over !\n");
        term.styleReset();
        process.exit(0);
    }

    term.grabInput(true);
    term.on('key', (name: string) => {
        if (name === 'q' || name === 'CTRL_C') {
            clearInterval(tickInterval);
            clearInterval(updateInterval);
            term.grabInput(false);
            term.clear();
            term("\x1B[?25h");
            process.exit();
        }
        if (name === 'UP' && poulet.location.y > frameY + 1) poulet.mailbox.push({ "key": "move", "params": [A.up] });
        else if (name === 'DOWN' && poulet.location.y < frameY + mapHeight - 2) poulet.mailbox.push({ "key": "move", "params": [A.down] });
        else if (name === 'LEFT' && poulet.location.x > frameX + 1) poulet.mailbox.push({ "key": "move", "params": [A.left] });
        else if (name === 'RIGHT' && poulet.location.x < frameX + mapWidth - 2) poulet.mailbox.push({ "key": "move", "params": [A.right] });

        if (checkCollision()) {
            gameOver();
        } else {
            //drawPlayer();
        }
    });
}

run();
