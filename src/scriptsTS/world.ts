#!/usr/bin/env node
//@ts-ignore

import terminalKit from 'terminal-kit';

const term = terminalKit.terminal;

const title = "CROSSY ROAD";

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
    const titleY = Math.floor(screenHeight / 2);

    const mapWidth = screenWidth /2;
    const mapHeight = screenHeight /2;

    term.moveTo(titleX, titleY).bgBlack().white().bold(title);

    // Top border
    term.moveTo(1, 1);
    term.bgWhite().white(' '.repeat(mapWidth));
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
    const animationInterval = setInterval(() => {
        // Effacer l’ancienne étoile
        term.moveTo(lastX, lastY);
        term.bgBlack().white(' ');

        // Nouvelle position aléatoire dans la fenêtre (hors bordures)
        const newX = Math.floor(Math.random() * (mapWidth - 2)) + 2;
        const newY = Math.floor(Math.random() * (mapHeight - 3)) + 2;

        // Afficher la nouvelle étoile
        term.moveTo(newX, newY);
        term.bgBlack().white('*');

        // Mémoriser la position pour la prochaine efface
        lastX = newX;
        lastY = newY;
    }, 1000);


    term.on('key', (name: any) => {
        if (name === 'q' || name === 'CTRL_C') {
            clearInterval(animationInterval); // stop animation
            term.grabInput(false);
            term.clear();
            process.exit();
        }
    });

}

run();
