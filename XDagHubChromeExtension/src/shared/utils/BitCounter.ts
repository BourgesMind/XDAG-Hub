
class BitCounter {
    private byteValue: number[];

    constructor() {
        this.byteValue = [33, 33];
    }

    init({ n1, n0 }: { n1: number, n0: number }) {
        this.byteValue = [n1, n0];
    }

    getValue(): { n0: number, n1: number } {
        return {
            n1: this.byteValue[1],
            n0: this.byteValue[0]
        }
    }

    getCurrentCharacter(): string {
        return String.fromCharCode(this.byteValue[0], this.byteValue[1]);
    }

    getNextCharacter(): string {
        this.byteValue[1] = (this.byteValue[1] + 1) % 126;
        if (this.byteValue[1] === 0) {
            this.byteValue[1] = 33;
            this.byteValue[0] = (this.byteValue[0] + 1) % 126
        }
        return this.getCurrentCharacter();
    }

}

export default BitCounter;
