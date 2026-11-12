"""Generate pixel cursors (arrow + hand) as crisp PNGs: cream fill, black outline, 2x nearest-neighbour."""
from PIL import Image
import os
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'img', 'cursor')
S = 2
ARROW = [
"B........",
"BB.......",
"BWB......",
"BWWB.....",
"BWWWB....",
"BWWWWB...",
"BWWWWWB..",
"BWWWWWWB.",
"BWWWWBBBB",
"BWWBWWB..",
"BWB.BWWB.",
"BB..BWWB.",
"B....BWWB",
".....BBBB",
]
HAND = [
"....BB.......",
"...BWWB......",
"...BWWB......",
"...BWWB......",
"...BWWBBB....",
"...BWWBWWBB..",
"BB.BWWBWWBWB.",
"BWBBWWWWWWWWB",
"BWWBWWWWWWWWB",
".BWWWWWWWWWWB",
"..BWWWWWWWWWB",
"..BWWWWWWWWB.",
"...BWWWWWWWB.",
"....BWWWWWB..",
"....BBBBBBB..",
]
def render(grid, name):
    h, w = len(grid), max(len(r) for r in grid)
    im = Image.new('RGBA', (w * S, h * S), (0, 0, 0, 0))
    px = im.load()
    for y, row in enumerate(grid):
        for x, c in enumerate(row):
            col = {'B': (0, 0, 0, 255), 'W': (245, 245, 240, 255)}.get(c)
            if col:
                for dy in range(S):
                    for dx in range(S):
                        px[x * S + dx, y * S + dy] = col
    im.save(os.path.join(OUT, name))
    print(name, im.size)
render(ARROW, 'arrow.png')
render(HAND, 'hand.png')
