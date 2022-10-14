import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable, switchMap, map } from 'rxjs';
import { MaterialService } from 'src/app/shared/classes/material.service';
import { Position } from 'src/app/shared/interfaces';
import { PositionService } from 'src/app/shared/services/positions.service';
import { OrderService } from '../order.service';

@Component({
  selector: 'app-order-positions',
  templateUrl: './order-positions.component.html',
  styleUrls: ['./order-positions.component.scss'],
})
export class OrderPositionsComponent implements OnInit {
  positions$!: Observable<Position[]>;

  constructor(
    private route: ActivatedRoute,
    private positionsService: PositionService,
    private order: OrderService
  ) {}

  ngOnInit() {
    this.positions$ = this.route.params.pipe(
      switchMap((params: Params) => {
        return this.positionsService.fetch(params['id']);
      }),
      map((positions: Position[]) => {
        return positions.map((position) => {
          position.quantity = 1;
          return position;
        });
      })
    );
  }

  addToOrder(position: Position) {
    MaterialService.toast(
      `Добавлено ${position.name} в количестве ${position.quantity} шт.`
    );
    console.log(position);
    this.order.add(position);
  }
}
