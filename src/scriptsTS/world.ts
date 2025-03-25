#!/usr/bin/env node
// @ts-ignore

import terminalKit from 'terminal-kit';

import * as A from '../actor.js';

const term = terminalKit.terminal;

const title = "CROSSY ROAD";

function init_game() : A.Line[]{
    const lines = new Array(20);
    return lines.map((i : any) => A.init_line(10, i));
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
    const titleY = 2;
    term.moveTo(titleX, titleY).bgBlack().white().bold(title);

    const mapWidth = Math.floor(screenWidth / 2);
    const mapHeight = Math.floor(screenHeight / 2);
    const frameX = Math.floor((screenWidth - mapWidth) / 2);
    const frameY = titleY + 2;

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
        }}

    // Bottom border
    term.moveTo(1, mapHeight);
    term.bgWhite().white(' '.repeat(mapWidth));
    term.styleReset();

    // Quitter avec 'q' ou 'CTRL_C'
    term.grabInput(true);

    // Animation : étoile aléatoire toutes les secondes
    const lastX = 2;
    const lastY = 2;
    const lines:A.Line[] = init_game();
    const tickInterval = setInterval(() => {
	lines.map((l : A.Line) => l.data.map((a : A.Actor) => a.send({"key" : "tick", "params" : []})));
    }, 100);
    term.on('key', (name: any) => {
        term.moveTo(frameX, frameY + mapHeight - 1);
        term.bgWhite().white(' '.repeat(mapWidth));
        term.styleReset();
    });

    drawFrame();

    let playerX = frameX + Math.floor(mapWidth / 2);
    let playerY = frameY + Math.floor(mapHeight / 2);

    function drawPlayer() {
        term.moveTo(playerX, playerY);
        term.bgBlack().yellow('█');
        term.styleReset();
        term.hideCursor();
    }

    function erasePlayer() {
        term.moveTo(playerX, playerY);
        term.bgBlack().white(' ');
        term.styleReset();
    }

    drawPlayer();

    const obstacles: boolean[][] = [];

    function drawObstacles() {
        // Efface l'intérieur de la map
        for (let y = 1; y < mapHeight - 1; y++) {
            term.moveTo(frameX + 1, frameY + y);
            term.bgBlack().white(' '.repeat(mapWidth - 2));
        }

        // Redessine les obstacles
        for (let i = 0; i < obstacles.length; i++) {
            const line = obstacles[i];
            const y = frameY + 1 + i;
            if (y >= frameY + mapHeight - 1) continue;

            term.moveTo(frameX + 1, y);
            for (let x = 0; x < line.length; x++) {
                if (line[x]) {
                    term.bgWhite().white(' ');
                } else {
                    term.bgBlack().white(' ');
                }
            }
            term.styleReset();
        }
    }



    function checkCollision(): boolean {
        const mapY = playerY - frameY - 1;
        const mapX = playerX - frameX - 1;

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
        clearInterval(tick);
        term.grabInput(false);
        term.moveTo(frameX, frameY + mapHeight + 1);
        term.red.bold("💥 Game Over !\n");
        term.styleReset();
    }

    const tick = setInterval(() => {
        // Génère une ligne vide
        const newLine = new Array(mapWidth - 2).fill(false);

        // Place entre 5 et 10 murs aléatoires
        const wallCount = Math.floor(Math.random() * 6) + 5;
        const indices = new Set<number>();
        while (indices.size < wallCount) {
            indices.add(Math.floor(Math.random() * (mapWidth - 2)));
        }
        for (const i of indices) newLine[i] = true;

        obstacles.unshift(newLine);
        if (obstacles.length > mapHeight - 2) {
            obstacles.pop();
        }

        drawObstacles();
        drawPlayer();

        if (checkCollision()) {
            gameOver();
        }
    }, 500);

    term.grabInput(true);
    term.on('key', (name: string) => {
        if (name === 'q' || name === 'CTRL_C') {
            clearInterval(tickInterval); // stop animation
            clearInterval(tick);
            term.grabInput(false);
            term.clear();
            process.exit();
        }

        erasePlayer();

        if (name === 'UP' && playerY > frameY + 1) playerY--;
        else if (name === 'DOWN' && playerY < frameY + mapHeight - 2) playerY++;
        else if (name === 'LEFT' && playerX > frameX + 1) playerX--;
        else if (name === 'RIGHT' && playerX < frameX + mapWidth - 2) playerX++;

        if (checkCollision()) {
            gameOver();
        } else {
            drawPlayer();
        }
    });
}

run();
