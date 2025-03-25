#!/usr/bin/env node
//@ts-ignore

import terminalKit from 'terminal-kit';

import * as A from "../actors"

const term = terminalKit.terminal;

const title = "CROSSY ROAD";

function make_road_left(){
    const actor = init_car_left();
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
    const actors = [A.init_chicken(), A.init_car_left()];
    const tickInterval = setInterval(() => {
	actors.map((a) => a.send({"key" : "tick", "params" : []}));
    }, 100);
    const addLevelInterval = setInterval(()=>{
	actors.map((a) => a.send({"key" : "move", "params" : [down]}));
    }, 1000);
    term.on('key', (name: any) => {
        if (name === 'q' || name === 'CTRL_C') {
            clearInterval(tickInterval); // stop animation
	    clearInterval(addLevelInterval)
            term.grabInput(false);
            term.clear();
            process.exit();
        }
    });

}

run();
