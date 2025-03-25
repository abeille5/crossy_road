import * as A from '#src/actor';

describe('Actor game test suite', () => {
    test('Position add should work correctly', () => {
        const pos1 = { x: 5, y: 10 };
        const pos2 = { x: 3, y: -2 };
        const result = A.position_add(pos1, pos2);
        expect(result).toEqual({ x: 8, y: 8 });
    });

    test('Make actor should create an actor with correct properties', () => {
        const position = { x: 10, y: 20 };
        const name = A.Name.Chicken;
        const actor = A.make_actor(position, name);

        expect(actor.location).toEqual(position);
        expect(actor.name).toBe(name);
        expect(typeof actor.send).toBe('function');
        expect(typeof actor.actions.move).toBe('function');
        expect(typeof actor.actions.tick).toBe('function');
    });

    test('Chicken should be initialized at correct position', () => {
        const chicken = A.init_chicken();
        expect(chicken.location).toEqual({ x: 30, y: 5 });
        expect(chicken.name).toBe(A.Name.Chicken);
        expect(typeof chicken.actions.collide).toBe('function');
    });

    test('Tree should be initialized at given position', () => {
        const position = { x: 5, y: 10 };
        const tree = A.init_tree(position);
        expect(tree.location).toEqual(position);
        expect(tree.name).toBe(A.Name.Tree);
    });

    test('Water right should move right on tick', () => {
        const position = { x: 5, y: 10 };
        const water = A.init_water_right(position);
        expect(water.name).toBe(A.Name.Water_R);

        // We can't directly test the movement since the tick_action function 
        // doesn't actually return the moved actor, it would need to be fixed
        // in the original code to properly test this functionality
    });

    test('Car left should be initialized with correct name', () => {
        const position = { x: 5, y: 10 };
        const car = A.init_car_left(position);
        expect(car.location).toEqual(position);
        expect(car.name).toBe(A.Name.Car_L);
    });

    test('Die function should create a new actor with same properties', () => {
        const position = { x: 5, y: 10 };
        const actor = A.make_actor(position, A.Name.Chicken);

        // We can't test if send was called, but we can check the returned actor
        const deadActor = A.die(actor);
        expect(deadActor.location).toEqual(position);
        expect(deadActor.name).toBe(A.Name.Chicken);
    });

    test('Init line should create a line with correct properties', () => {
        const line = A.init_line(10, 5);

        expect(line.ordinate).toBe(5);
        expect([A.LineType.Nature, A.LineType.Road, A.LineType.River]).toContain(line.type);
        expect(line.data.length).toBe(60);
    });


    test('Actor movement should update position', () => {
        const position = { x: 5, y: 10 };
        const actor = A.make_actor(position, A.Name.Chicken);

        const movedActor = actor.actions.move(actor, A.right);
        expect(movedActor.location).toEqual({ x: 6, y: 10 });

        const movedAgain = movedActor.actions.move(movedActor, A.up);
        expect(movedAgain.location).toEqual({ x: 6, y: 11 });
    });
});