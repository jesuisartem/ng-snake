import {ChangeDetectionStrategy, Component, HostListener, OnInit} from '@angular/core';
import {Grid} from "../../interfaces/grid";
import {BehaviorSubject, filter, first, Subject} from "rxjs";
import {Snake} from "../../interfaces/snake";
import {Direction} from "../../interfaces/direction";

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent implements OnInit {
  public grid$ = new BehaviorSubject<Grid | null>(null);
  public snake$ = new BehaviorSubject<Snake | null>(null);

  public foodCoords$ = new BehaviorSubject<[number, number] | null>(null);
  public currentDirection$ = new BehaviorSubject<Direction | null>(null);

  public foodEaten$ = new Subject<void>();

  constructor() {
  }

  public ngOnInit(): void {
    this.initFood();
    this.addFoodOnEat();
    this.onSnakeLengthChange();

    this.createGrid(10);
    this.createSnake();
  }

  @HostListener('window:keydown',['$event'])
  public handleKeyDown(event: KeyboardEvent) {
    const direction = event.key;
    if (this.isDirection(direction)) {
      this.currentDirection$.next(direction);
      this.moveSnake(direction);
    }
  }

  private isDirection(string: string): string is Direction {
    return Object.values(Direction).includes(string as Direction);
  }

  private createGrid(size: number): void {
    const newGrid: Grid = {
      size,
      cells: Array.from({ length: size }, () => Array.from({ length: size }, () => ({
        is_food: false,
        is_snake: false,
      }))),
    };
    this.grid$.next(newGrid);
  }

  private createSnake(): void {
    const newSnake: Snake = {
      length: 2,
      cells: [
        {
          x: 1,
          y: 1,
          is_head: true,
          is_tail: false,
        },
        {
          x: 1,
          y: 2,
          is_head: false,
          is_tail: false,
        }
      ]
    };
    this.snake$.next(newSnake);
  }

  private addFoodOnEat(): void {
    this.foodEaten$
      .pipe()
      .subscribe(_ => this.addFoodToGrid());
  }

  private initFood(): void {
    this.snake$
      .pipe(
        filter(snake => !!snake),
        first(),
      )
      .subscribe(() => this.addFoodToGrid());
  }

  private addFoodToGrid(): void {
    const currentGrid = this.grid$.getValue();
    const snake = this.snake$.getValue();
    if (!currentGrid || !snake) return;
    this.removeFood(currentGrid);
    let foodCoords: [number, number];

    do {
      foodCoords = this.getRandomCellCoords(currentGrid.size)
    } while (snake.cells.find(snakeCell => foodCoords[0] === snakeCell.x && foodCoords[1] === snakeCell.y))

    currentGrid.cells[foodCoords[0]][foodCoords[1]].is_food = true;
    this.foodCoords$.next(foodCoords);
    this.grid$.next(currentGrid);
  }

  private removeFood(grid: Grid): void {
    const foodCoords = this.foodCoords$.getValue();
    if (!foodCoords) return;
    grid.cells[foodCoords[0]][foodCoords[1]].is_food = false;
    this.grid$.next(grid);
  }

  private getRandomCellCoords(max: number): [number, number] {
    return [Math.floor(Math.random() * max), Math.floor(Math.random() * max)];
  }

  private moveSnake(direction: Direction): void {
    const snake = this.snake$.getValue();
    if (!snake) return;
    if (direction === Direction.Up) this.moveUp(snake);
    if (direction === Direction.Down) this.moveDown(snake);
    if (direction === Direction.Right) this.moveRight(snake);
    if (direction === Direction.Left) this.moveLeft(snake);
  }

  private moveRight(snake: Snake): void {
    snake.cells = snake.cells.map((cell, index) => {
      if (!cell.is_head) {
        cell = {
          ...cell,
          x: snake.cells[0].x - 1,
          y: snake.cells[0].y,
        }
      } else {
        cell.x = cell.x + 1;
      }
      return cell;
    });
    //console.log(snake)
    this.snake$.next(snake);
  }

  private moveLeft(snake: Snake): void {

  }

  private moveUp(snake: Snake): void {

  }

  private moveDown(snake: Snake): void {

  }

  private onSnakeLengthChange(): void {
    this.snake$
      .pipe(
        filter(snake => !!snake),
      )
      .subscribe(snake => this.setSnakeCellsOnGrid(snake));
  }

  private setSnakeCellsOnGrid(snake: Snake | null): void {
    const grid = this.grid$.getValue();
    if (!grid) return;
    grid.cells = grid.cells.map(line => {
      line = line.map(cell => ({
        ...cell,
        is_snake: false,
      }));
      return line;
    })
    if (snake) {
      for (const coords of snake.cells.map(cell => [cell.x, cell.y])) {
        console.log(coords)
        grid.cells[coords[0]][coords[1]].is_snake = true;
      }
    }
    this.grid$.next(grid);
  }
}
