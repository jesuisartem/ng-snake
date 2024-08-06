import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Grid} from "../../interfaces/grid";
import {BehaviorSubject, Subject  } from "rxjs";
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
    this.createSnake();
    this.createGrid(5);
    this.addFood();
    this.onSnakeLengthChange();
  }

  private createGrid(size: number): void {
    const newGrid: Grid = {
      size,
      cells: Array.from({ length: size }, () => Array.from({ length: size }, () => ({
        is_food: false,
        is_snake: false,
      }))),
    };
    const foodCoords = this.getRandomCellCoords(size);
    newGrid.cells[foodCoords[0]][foodCoords[1]].is_food = true;
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
          is_head: true,
          is_tail: false,
        }
      ]
    };
    this.snake$.next(newSnake);
  }

  private addFood(): void {
    this.foodEaten$
      .pipe()
      .subscribe(_ => this.addFoodToGrid());
  }

  private addFoodToGrid(): void {
    const currentGrid = this.grid$.getValue();
    const snake = this.snake$.getValue();
    if (!currentGrid || !snake) return;
    this.removeFood(currentGrid);
    const foodCoords = this.getRandomCellCoords(currentGrid.size);
    if (!snake.cells.find(snakeCell => foodCoords[0] === snakeCell.x && foodCoords[1] === snakeCell.y)) {
      currentGrid.cells[foodCoords[0]][foodCoords[1]].is_food = true;
      this.foodCoords$.next(foodCoords);
    }
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

  private moveSnake(): void {
    const direction = this.currentDirection$.getValue();
    if (!direction) return;
    // логика передвижения змейки

  }

  private onSnakeLengthChange(): void {
    this.snake$
      .pipe()
      .subscribe(snake => this.setSnakeCellsOnGrid(snake));
  }

  private setSnakeCellsOnGrid(snake: Snake | null): void {
    const grid = this.grid$.getValue();
    if (!grid) return;
    if (!snake || !snake.length) {
      grid.cells.forEach(line => line.map(cell => ({
        ...cell,
        is_snake: false,
      })));
    } else {
      for (const coords of snake.cells.map(cell => [cell.x, cell.y])) {
        grid.cells[coords[0]][coords[1]].is_snake = true;
      }
      this.grid$.next(grid);
    }
  }

}
