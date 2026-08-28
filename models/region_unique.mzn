int: CELL_COUNT;
int: CLUE_COUNT;
set of int: CELLS = 1..CELL_COUNT;
set of int: CLUES = 1..CLUE_COUNT;

array[CLUES] of int: clue_total;
array[CLUES, CELLS] of 0..1: incidence;
array[CELLS] of 0..1: target;
bool: block_target;

array[CELLS] of var 0..1: x;

constraint forall(clue in CLUES)(
  sum(cell in CELLS)(incidence[clue, cell] * x[cell]) = clue_total[clue]
);

constraint if block_target then
  exists(cell in CELLS)(x[cell] != target[cell])
else
  true
endif;

solve satisfy;

output ["x = ", show(x)];
