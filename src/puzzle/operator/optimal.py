""" This script calculates the minimum number of moves needed to reach each of
    the possible queries and outputs them to a folder where each filename is the
    first number in the query. Within a file the queries are orderd [q,-99,-99],
    [q,-99,-98], ..., [q,99,98], [q,99,99] """

from collections import deque
import numpy as np
from itertools import product
import os
import shutil

MIN_VALUE, MAX_VALUE = -99, 99
VAL_RANGE = MAX_VALUE - MIN_VALUE + 1
TOTAL_ITEMS = VAL_RANGE ** 3
ACTIONS = [
    lambda x: (x[0], x[1], x[2] + 1),
    lambda x: (x[0], x[1], x[2] - 1),
    lambda x: (x[0], x[1], 0),
    lambda x: (x[2], x[1], x[0]),
    lambda x: (x[2], x[0], x[1]),
    lambda x: (x[0], x[1], -x[2]),
    lambda x: (x[0], x[1], x[0] + x[1]),
    lambda x: (x[0], x[1], x[0] * x[1]),
]

# Calucalte number of moves using BFS with memoization
mem = np.full((VAL_RANGE, VAL_RANGE, VAL_RANGE), -1)
q = deque()
q.append(((0, 0, 0), 0))
mem[-MIN_VALUE, -MIN_VALUE, -MIN_VALUE] = 0

i = 1
while len(q) > 0:
    item, dist = q.popleft()
    for action in ACTIONS:
        result = action(item)
        valid = True
        for v in result:
            if v not in range(MIN_VALUE, MAX_VALUE + 1):
                valid = False
                break
        index = tuple(x - MIN_VALUE for x in result)
        if not valid or mem[index] != -1:
            continue
        mem[index] = dist + 1
        q.append((result, dist + 1))
    i += 1
    if i % 10000 == 0:
        print(f"{i / TOTAL_ITEMS * 100:.2f} % done...")

print("Writing to output folder...")

# Output to folders
folder = os.path.join(os.path.dirname(__file__), "optimal")
if os.path.isdir(folder):
    shutil.rmtree(folder)
os.makedirs(folder, exist_ok=True)
for i in range(VAL_RANGE):
    f = open(os.path.join(folder, f"{i+MIN_VALUE}.txt"), "w")
    for j, k in product(range(VAL_RANGE), range(VAL_RANGE)):
        f.write(f"{mem[i, j, k]},")