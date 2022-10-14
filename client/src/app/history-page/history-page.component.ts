import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  MaterialInstance,
  MaterialService,
} from '../shared/classes/material.service';
import { Filter, Order } from '../shared/interfaces';
import { OrdersService } from '../shared/services/orders.service';

const STEP = 2;

@Component({
  selector: 'app-history-page',
  templateUrl: './history-page.component.html',
  styleUrls: ['./history-page.component.scss'],
})
export class HistoryPageComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('tooltip') tooltipRef!: ElementRef;
  tooltip!: MaterialInstance;
  isFilterVisible = false;
  oSub!: Subscription;

  orders: Order[] = [];
  filter: Filter = {};

  offset = 0;
  limit = STEP;

  loading = false;
  reloading = false;
  noMoreOrders = false;

  constructor(private ordersService: OrdersService) {}

  ngOnInit(): void {
    this.reloading = true;
    this.fetch();
  }

  private fetch() {
    const params = Object.assign({}, this.filter, {
      offset: this.offset,
      limit: this.limit,
    });
    this.oSub = this.ordersService.fetch(params).subscribe((orders) => {
      this.orders = this.orders.concat(orders);
      this.noMoreOrders = orders.length < STEP;
      this.loading = false;
      this.reloading = false;
    });
  }

  ngOnDestroy(): void {
    this.tooltip.destroy?.();
    this.oSub.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.tooltip = MaterialService.initTooltip(this.tooltipRef);
  }

  applyFilter(filter: Filter) {
    this.orders = [];
    this.offset = 0;
    this.filter = filter;
    this.reloading = true;
    this.fetch();
  }

  loadMore() {
    this.offset += STEP;
    this.loading = true;
    this.fetch();
  }

  isFiltered(): boolean {
    return Object.keys(this.filter).length !== 0;
  }
}
