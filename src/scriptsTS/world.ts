#!/usr/bin/env node
//@ts-ignore

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

    const titleWidth = title.length;
    const titleX = Math.floor((screenWidth - titleWidth) / 2);
    const titleY = 2;

    const mapWidth = Math.min(screenWidth - 10, 60);
    const mapHeight = Math.min(screenHeight - 10, 20);

    term.moveTo(titleX, titleY).bgBlack().white().bold(title);

    // Top border
    term.moveTo(Math.floor((screenWidth - title.length) / 2), titleY);
    term.bgBlack().white().bold(title);
    term.styleReset();

    // Side borders and empty lines
    for (let y = 1; y < mapHeight - 1; y++) {
        term.moveTo(1, y + 1);
        term.bgWhite().white(' ');
        term.bgBlack().white(' '.repeat(mapWidth - 2));
        term.bgWhite().white(' ');
        term.styleReset();
    }

    // Bottom border
    term.moveTo(1, mapHeight);
    term.bgWhite().white(' '.repeat(mapWidth));
    term.styleReset();

    // Quitter avec 'q' ou 'CTRL_C'
    term.grabInput(true);

    // Animation : étoile aléatoire toutes les secondes
    let lastX = 2;
    let lastY = 2;
    const lines:A.Line[] = init_game();
    const tickInterval = setInterval(() => {
	lines.map((l : A.Line) => l.data.map((a : A.Actor) => a.send({"key" : "tick", "params" : []})));
    }, 100);
    term.on('key', (name: any) => {
        if (name === 'q' || name === 'CTRL_C') {
            clearInterval(tickInterval); // stop animation
            term.grabInput(false);
            term.clear();
            process.exit();
        }
    });

}

run();
