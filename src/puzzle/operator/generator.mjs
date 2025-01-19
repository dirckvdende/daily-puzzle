
export { generateRandomQuery };
import { random } from "../../js/random.mjs";
import { dateIndex } from "../../js/puzzle.mjs";

// Probability of making any number negative
const negativeProb = 0.15;
// Probability of 2 or 3 large numbers
const twoProb = 0.2, threeProb = 0.05;

/**
 * Generate a random puzzle query. Takes different versions of query generation
 * into account
 * @returns The random query that was generated
 */
function generateRandomQuery() {
    if (dateIndex <= 3)
        return generateRandomQueryV1();
    let r = random();
    let largeNumbers = r < threeProb ? 3 : (r < twoProb + threeProb ? 2 : 1);
    let query = [];
    for (let i = 0; i < 3; i++) {
        if (i < largeNumbers)
            query.push(generateLargeNumber());
        else
            query.push(generateSmallNumber());
    }
    for (let i = 0; i < 3; i++)
        if (random() < negativeProb)
            query[i] = -query[i];
    randomShuffle(query);
    return query;
}

/**
 * Generate a random large number
 * @returns The number
 */
function generateLargeNumber() {
    let x = Math.floor(random() * 6);
    let y = Math.floor(random() * 6 + 1);
    let z = Math.floor(random() * 6 + 1);
    // At least: 10 + 1 + 1 = 12
    // At most: 10 + 5 * 5 + 6 + 6 = 47
    let cur = 10 + x * x + y + z;
    // Rarely adds another square of at most 49
    if (random() < 0.1) {
        let w = Math.floor(random() * 7 + 1);
        cur += w * w;
    }
    return cur;
}

/**
 * Generate a random small number
 * @return The number
 */
function generateSmallNumber() {
    const choices = [0, 1, 1, 1, 2, 2, 2, 3, 3, 4, 5, 6, 7, 8, 9];
    return choices[Math.floor(random() * choices.length)];
}

/**
 * Randomly shuffle query in-place using Fisher-Yates
 * @param {Array} query The query to shuffle
 */
function randomShuffle(query) {
    for (let i = 0; i < query.length; i++) {
        let j = i + Math.floor(random() * (query.length - i));
        let tmp = query[i];
        query[i] = query[j];
        query[j] = tmp;
    }
}

/**
 * Version 1 of generating a random query
 * @returns The random query generated
 */
function generateRandomQueryV1() {
    let bestScore = -Infinity;
    let bestQuery = [0, 0, 0];
    for (let i = 0; i < 10; i++) {
        let curQuery = sampleRandomQuery();
        let curScore = queryScore(curQuery);
        if (curScore > bestScore) {
            bestScore = curScore;
            bestQuery = curQuery;
        }
    }
    return bestQuery;
}

/**
 * Generates a single random query of three numbers
 * @returns The random query
 */
function sampleRandomQuery() {
    let query = [0, 0, 0];
    for (let i = 0; i < query.length; i++) {
        let cur;
        if (random() < 0.8) {
            const choices = [0, 1, 1, 1, 2, 2, 3, 4, 5, 6];
            cur = choices[Math.floor(random() * choices.length)];
        } else {
            let x = Math.floor(random() * 6);
            let y = Math.floor(random() * 4);
            let z = Math.floor(random() * 5 - 2);
            cur = x * x + y + z;
            if (random() < 0.1)
                cur += Math.floor(random() * 20)
        }
        if (random() < 0.2)
            cur = -cur;
        query[i] = cur;
    }
    return query;
}

/**
 * Get the score of a query, which is given by the following sum:
 *   total absolute value / 5
 * + total sum / 5
 * + # positive values * 10
 * + largest diff in abs values ** 2 / 4
 * @param {Array} query The query to get the score of
 * @returns The score of the query
 */
function queryScore(query) {
    let total = 0;
    let smallestAbs = 100, largestAbs = 0;
    for (const value of query) {
        total += Math.abs(value) / 5;
        total += value / 5;
        if (value > 0)
            total += 10;
        smallestAbs = Math.min(smallestAbs, value);
        largestAbs = Math.min(largestAbs, value);
    }
    total += (largestAbs - smallestAbs) * (largestAbs - smallestAbs) / 4;
    return total;
}