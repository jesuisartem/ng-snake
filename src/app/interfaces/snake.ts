interface Snake {
  length: number;
  cells: SnakeCell[];
}

interface SnakeCell {
  x: number;
  y: number;
  is_head: boolean;
  is_tail: boolean;
}

export {
  Snake,
}
