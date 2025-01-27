
export { DisjointUnion };

/**
 * A disjoint union (DSU) of elements where components can be joined based on
 * contained elements
 */
class DisjointUnion {
    /**
     * Constructor
     * @param {number} size The number of elements in the DSU
     */
    constructor (size) {
        this.prev = [];
        this.sizes = [];
        this.parts = size;
        for (let i = 0; i < size; i++) {
            this.prev.push(-1);
            this.sizes.push(1);
        }
    }
    /**
     * Find the root of one of the elements in the DSU
     * @param {number} x The index of the element to find the root of
     * @returns The root of the element
     */
    find(x) {
        if (this.prev[x] < 0)
            return x;
        let parent = this.find(this.prev[x]);
        return this.prev[x] = parent;
    }
    /**
     * Combines the parts of two elements into one. Has no effect if two
     * elements are already in the same part
     * @param {number} x The first element
     * @param {number} y The second element
     */
    join(x, y) {
        x = this.find(x);
        y = this.find(y);
        if (x == y)
            return;
        this.parts--;
        if (this.sizes[x] < this.sizes[y]) {
            let temp = x;
            x = y;
            y = temp;
        }
        this.prev[y] = x;
        this.sizes[x] += this.sizes[y];
    }
}