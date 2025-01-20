""" This script calculates the minimum number of moves needed to solve each
    possible puzzle. Puzzles are represented using bitsets of 16 bits """

from collections import deque
import numpy as np
import os
from itertools import product

ROWS, COLS = 4, 4
CELL_COUNT = ROWS * COLS

def get_index(x: int, y: int) -> int:
    if x < 0 or y < 0 or x >= ROWS or y >= COLS:
        return -1
    return x * COLS + y

def do_flips(state: int, x: int, y: int, diff: tuple[tuple[int, int]]) -> int:
    for dx, dy in diff:
        i = get_index(x + dx, y + dy)
        if i >= 0:
            state ^= 1 << i
    return state

def full_rect(state: int, x: int, y: int) -> int:
    return do_flips(state, x, y, ((-1, -1), (0, -1), (1, -1), (-1, 0), (0, 0),
    (1, 0), (-1, 1), (0, 1), (1, 1)))

def plus(state: int, x: int, y: int) -> int:
    return do_flips(state, x, y, ((0, -1), (-1, 0), (0, 0), (1, 0), (0, 1)))

def times(state: int, x: int, y: int) -> int:
    return do_flips(state, x, y, ((-1, -1), (-1, 1), (0, 0), (1, -1), (1, 1)))

# Calucalte number of moves using BFS with memoization
mem = np.full(1 << CELL_COUNT, -1)
# Tuples are (state, #moves)
q: deque[tuple[int, int]] = deque()
q.append((0, 0))
mem[0] = 0

i = 1
while len(q) > 0:
    state, dist = q.popleft()
    for action in (full_rect, plus, times):
        for x, y in product(range(ROWS), range(COLS)):
            dest = action(state, x, y)
            if mem[dest] != -1:
                continue
            mem[dest] = dist + 1
            q.append((dest, dist + 1))
    i += 1
    if i % 10000 == 0:
        print(f"{i / (1 << CELL_COUNT) * 100:.2f} % done...")

path = os.path.join(os.path.dirname(__file__), "optimal.txt")
f = open(path, "w")
for i in range(1 << CELL_COUNT):
    f.write(f"{mem[i]},")