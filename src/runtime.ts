import {Actor } from "./actor.ts";

type World = {
    actors: Actor[];
    time: number;
    tick: number;
}

function make_world() : world{
    // Crée un World avec une liste d'acteurs vide, un time à 0 et un tick à 0.5
    const world:World = {actors : [],
		       time:0,
		       tick:0.5};
    return world;
}

function add_actor(actors:Actor[], w:World):World{
    // Retourne un World contenant une liste d'acteurs ajoutés
    return {actors:actors.concat(w.actors),
	    time:w.time,
	    tick:w.tick};
}

function send_tick(w:World){
    //Met à jour tous les acteurs d'un world
    w.actors.map((a) => a.send({key : "tick", params: []});
}

function find_actor(a:Actor, w:World):Actor{
    
}
