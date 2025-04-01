#!/usr/bin/env node
// @ts-ignore

import terminalKit from 'terminal-kit';

import * as A from '../actor.js';

const term = terminalKit.terminal;

const title = "CROSSY ROAD";

const nb_line:number = 14;

const line_length:number = 60;

function init_game() : A.Line[]{
    const lines: A.Line[]= Array.from({length : nb_line}, () => A.init_line(0, 0));
    lines.map((l : A.Line) => A.init_line(line_length, lines.indexOf(l)));
    console.log(typeof(lines[0]));
    for (let i = 0; i < nb_line; i++)
	for (let j = 0; j<line_length; j++)
	    console.log(typeof(lines[i].data[j]));
    return lines;
}


function run() {
    term.clear();
    const screenWidth = term.width;
    const screenHeight = term.height;

    if (!screenWidth || !screenHeight) {
        console.error("Could not determine terminal dimensions.");
        process.exit(1);
    }

    const titleX = Math.floor((screenWidth - title.length) / 2);
    const titleY = 7;
    term.moveTo(titleX, titleY).bgBlack().white().bold(title);

    const mapWidth = Math.floor(screenWidth / 2);
    const mapHeight = Math.floor(screenHeight / 2);
    const frameX = Math.floor((screenWidth - mapWidth) / 2);
    const frameY = titleY + 2;

    function drawFrame() {
        term.moveTo(frameX, frameY);
        term.bgWhite().yellow(' '.repeat(mapWidth));
        term.styleReset();

        for (let y = 1; y < mapHeight - 1; y++) {
            term.moveTo(frameX, frameY + y);
            term.bgWhite().white(' ');
            term.bgBlack().white(' '.repeat(mapWidth - 2));
            term.bgWhite().white(' ');
            term.styleReset();
        }}

    term.moveTo(frameX, frameY + mapHeight - 1);
    term.bgWhite().white(' '.repeat(mapWidth));
    term.styleReset();
    term.grabInput(true);

    function tickLine(l : A.Line):A.Line{
	if (l.ordinate===-1)
	    return A.init_line(10, 20);
	l.data.map((a : A.Actor) => a.mailbox.push({"key":"move", "params":[A.down]}));
	l.data.map((a : A.Actor) => a.actions.tick(a));
	l.ordinate -= 1;
	return l;
    }

    // Animation : étoile aléatoire toutes les secondes
    const lastX = 2;
    const lastY = 2;
    const lines:A.Line[] = init_game();
    const tickInterval = setInterval(() => {
	lines.map((l : A.Line) => tickLine(l));
	poulet = poulet.actions.tick(poulet);
	}, 100);


    term.on('key', (name: any) => {
        term.moveTo(frameX, frameY + mapHeight - 1);
        term.bgWhite().white(' '.repeat(mapWidth));
        term.styleReset();
    });

    const posInit:A.Position = {x:frameX + Math.floor(mapWidth / 2)-2,y:frameY + Math.floor(mapHeight / 2)};
    let poulet:A.Actor = A.make_actor(posInit,A.Name.Chicken);

    function drawPlayer() {
        term.moveTo(poulet.location.x,poulet.location.y);
        term.bgBlack().white('🐔');
        term.styleReset();
        term.hideCursor();
    }

    function erasePlayer() {
        term.moveTo(poulet.location.x,poulet.location.y);
        term.bgBlack().white(' ');
        term.styleReset();
    }

    function drawActor(a:A.Actor, x:number, y:number): A.Actor{
	term.moveTo(0, 0);
	console.log(a.name);
	term.moveTo(x, y);
	if (a.name === A.Name.Tree)
	    term.bgBlack().green('A');
	else if (a.name === A.Name.Water_R || a.name === A.Name.Water_L)
	    term.bgBlack().blue('A');
	else if (a.name === A.Name.Log_R || a.name === A.Name.Log_L)
	    term.bgBlack().brown('A');
	else if (a.name === A.Name.Car_R || a.name === A.Name.Car_L)
	    term.bgBlack().grey('A');
	else if (a.name === A.Name.Chicken)
	    term.bgBlack().white('C');
	else
	    term.bgBlack().black(' ');
	term.styleReset();
	return a.update(a);
    }

    const updateInterval = setInterval(() => {
	drawFrame();
	lines.map((l: A.Line) => l.data.map((a : A.Actor) => drawActor(a, nb_line - l.ordinate, a.location.y)));
	poulet = poulet.update(poulet);
	drawActor(poulet, poulet.location.x, poulet.location.y);
	}, 10);

    const obstacles: boolean[][] = [];

    function drawObstacles() {
        // Redessine uniquement les obstacles

        obstacles.forEach((line, i) => {
            const y = frameY + 1 + i;
            if (y < frameY + mapHeight - 1)
            {
                term.moveTo(frameX + 1, y);
                line.forEach((x)=>{
                    if (x) {
                        term.bgGreen().white(' ');
                    } else {
                        term.bgBlack().white(' ');
                    }
                });      
                term.styleReset();
            }
        });
    }

    function checkCollision(): boolean {
        const mapY = poulet.location.y - frameY - 1;
        const mapX = poulet.location.x - frameX - 1;

        if (
            mapY >= 0 &&
            mapY < obstacles.length &&
            mapX >= 0 &&
            mapX < mapWidth - 2 &&
            obstacles[mapY][mapX +1]
        ) {
            return true;
        }
        return false;
    }
    function clearMap() {
        for (let y = 0; y < mapHeight - 2; y++) {
            term.moveTo(frameX + 1, frameY + 1 + y);
            term.bgBlack().white(' '.repeat(mapWidth - 2)); // Redessine une ligne vide
        }
        term.styleReset();
    }

    function gameOver() {
        term("\x1B[?25h");
        clearInterval(tick);
        clearInterval(tickInterval);
        term.grabInput(false);
        term.moveTo(frameX, frameY + mapHeight + 1);
        term.red.bold("💥 Game Over !\n");
        term.styleReset();
        process.exit(0);
    }

    const tick = setInterval(() => {/*

        const newLine = new Array(mapWidth - 2).fill(false);
    
        // Largeurs aléatoires des courbes
        const leftWidth = Math.floor(Math.random() * 6) + 5; // Entre 5 et 10
        const rightWidth = Math.floor(Math.random() * 6) + 5; // Entre 5 et 10
    
        // Générer la courbe à gauche
        for (let x = 0; x < leftWidth; x++) {
            newLine[x] = true;
        }
    
        // Générer la courbe à droite
        for (let x = mapWidth - 3; x >= mapWidth - 3 - rightWidth; x--) {
            newLine[x] = true;
        }
    
        // Ajouter la nouvelle ligne en haut
        obstacles.unshift(newLine);
    
        // Supprimer les lignes dépassant la hauteur de la carte
        if (obstacles.length > mapHeight - 2) {
            obstacles.pop();
        }
    
        // Redessiner les obstacles et le joueur
        clearMap();
        drawObstacles();
        drawPlayer();
    
        // Vérifier les collisions
        if (checkCollision()) {
            gameOver();
        }
    */}, 300);

    term.grabInput(true);
    term.on('key', (name: string) => {
        if (name === 'q' || name === 'CTRL_C') {
            clearInterval(tickInterval); 
            clearInterval(updateInterval);
            clearInterval(tick);
            term.grabInput(false);
            term.clear();
            term("\x1B[?25h");
            process.exit();
        }

        erasePlayer();

        if (name === 'UP' && poulet.location.y > frameY + 1) poulet.mailbox.push({"key":"move","params":[A.up]});
        else if (name === 'DOWN' && poulet.location.y < frameY + mapHeight - 2) poulet.mailbox.push({"key":"move","params":[A.down]});
        else if (name === 'LEFT' && poulet.location.x > frameX + 1) poulet.mailbox.push({"key":"move","params":[A.left]});
        else if (name === 'RIGHT' && poulet.location.x < frameX + mapWidth - 2) poulet.mailbox.push({"key":"move","params":[A.right]});

        if (checkCollision()) {
            gameOver();
        } else {
            drawObstacles();
            drawPlayer();
        }
    });
}

run();
