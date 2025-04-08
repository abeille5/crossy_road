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
    let screenHeight = term.height;
    if (screenHeight % 2 == 1) 
        screenHeight = screenHeight -1 ;

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

    

    drawFrame();
    term.moveTo(frameX, frameY + mapHeight - 1);
    term.bgWhite().white(' '.repeat(mapWidth));
    term.styleReset();
    term.grabInput(true);
    let count_void = 0;
    function tickLine(l: A.Line): A.Line {
        if (l.ordinate < 0) {
            count_void++;
            return A.init_line(line_length, nb_line - 1, 0, count_void % 2, []);
        }
        l.data.map((a: A.Actor) => a.mailbox.push({ "key": "move", "params": [A.down] }));
        l.data.map((a: A.Actor) => a.actions.tick(a));
        l.ordinate -= 1;
        return l;
    }

    // Animation : étoile aléatoire toutes les secondes
    const lastX = 2;
    const lastY = 2;
    let lines: A.Line[] = new Array(nb_line).fill(null).map((_, i: number) => A.init_line(line_length, i, 0, i % 2, []));
    const tickInterval = setInterval(() => {
        lines = lines.map((l: A.Line) => tickLine(l));
        poulet = poulet.actions.tick(poulet);
    }, 500);

    term.on('key', (name: any) => {
        term.moveTo(frameX, frameY + mapHeight - 1);
        term.bgWhite().white(' '.repeat(mapWidth));
        term.styleReset();
    });

    // Remplacer la ligne de posInit par
    const posInit: A.Position = { 
        x: Math.floor(line_length / 2), // Utiliser line_length au lieu de mapWidth
        y: Math.floor(nb_line / 2)      // Utiliser nb_line au lieu de mapHeight
    };
    let poulet: A.Actor = A.make_actor(posInit, A.Name.Chicken);
    let lifes: number = 5;

    function drawActor(a: A.Actor, x: number, y: number): A.Actor {
        if (y > nb_line)
            return a.update(a);
        if (a.name !== A.Name.Chicken && (x === poulet.location.x && y === poulet.location.y)) {
            term.moveTo(5, 5);
            return a.update(a);
        }
    
        // Convertir les coordonnées logiques en coordonnées d'affichage
        const screenX = frameX + x + 1;
        const screenY = frameY + y;
    
        term.moveTo(screenX, screenY);
        if (a.name === A.Name.Tree)
            term.bgGreen().white(' ');
        else if (a.name === A.Name.Water_R || a.name === A.Name.Water_L)
            term.bgBrightBlue().white(' ');
        else if (a.name === A.Name.Log_R || a.name === A.Name.Log_L)
            term.bgColorRgb(139, 69, 19).white(' ');
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
        l.data = l.data.map((a: A.Actor) => drawActor(a,a .location.x, nb_line - l.ordinate));
        return l;
    }

    const updateInterval = setInterval(() => {
	if (checkCollision()){
	    lifes = lifes - 1;
	}
	if (lifes < 0)
	    gameOver();
	else {
	    term.moveTo(screenWidth/10, screenHeight/10);
            term.bgBlack().red('❤️ '.repeat(lifes));}
	
        lines = lines.map((l: A.Line) => drawLine(l));
        poulet = drawActor(poulet, poulet.location.x, poulet.location.y);
	
    }, 100);

    const pouletInterval = setInterval(() => { poulet = drawActor(poulet, poulet.location.x, poulet.location.y); }, 10);


    function isCollision(a:A.Actor): boolean {
	if (a.location.x === poulet.location.x && a.location.y === poulet.location.y){
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
        lines.forEach((l : A.Line) => {
	    l.data.forEach((a : A.Actor) => {if (isCollision(a)) flag = true; });
	});
	return flag;
    }

    function gameOver() {
        term("\x1B[?25h");
        clearInterval(tickInterval);
	    clearInterval(pouletInterval);
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
	    clearInterval(pouletInterval);
            term.grabInput(false);
            term.clear();
            term("\x1B[?25h");
            process.exit();
        }
        if (name === 'UP' && poulet.location.y > 1) poulet.mailbox.push({ "key": "move", "params": [A.up] });
        else if (name === 'DOWN' && poulet.location.y < mapHeight-4) poulet.mailbox.push({ "key": "move", "params": [A.down] });
        else if (name === 'LEFT' && poulet.location.x > 0) poulet.mailbox.push({ "key": "move", "params": [A.left] });
        else if (name === 'RIGHT' && poulet.location.x < mapWidth -5) poulet.mailbox.push({ "key": "move", "params": [A.right] });

    });
}

run();
