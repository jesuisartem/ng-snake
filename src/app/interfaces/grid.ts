interface Grid {
  size: number;
  cells: GridCell[][];
}

interface GridCell {
  is_snake: boolean;
  is_food: boolean;
}

export {
  Grid,
  GridCell,
}
