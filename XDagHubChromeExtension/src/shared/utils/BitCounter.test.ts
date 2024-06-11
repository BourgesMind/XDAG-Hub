import { describe, expect, it } from 'vitest';
import BitCounter from './BitCounter';

const bitCounter = new BitCounter();

describe('BitCounter', () => {
    it('getNextCharacter should return characters incrementally', () => {
        let cur = bitCounter.getCurrentCharacter();
        console.log("\ncur:", cur);
        expect(cur).toEqual(String.fromCharCode(33, 33));
        expect(bitCounter.getNextCharacter()).toEqual(String.fromCharCode(33, 34));
        // for (let i = 0; i < 1000; i++) {
        //     const x = bitCounter.getNextCharacter();
        //     console.log(i,"-x:", x)
        // }
    });
});
