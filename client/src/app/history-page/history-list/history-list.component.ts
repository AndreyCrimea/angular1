import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  MaterialInstance,
  MaterialService,
} from 'src/app/shared/classes/material.service';
import { Order } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss'],
})
export class HistoryListComponent implements OnDestroy, AfterViewInit {
  @Input() orders: Order[] = [];
  @ViewChild('modal') modalRef!: ElementRef;

  selectedOrder!: Order;

  modal!: MaterialInstance;

  constructor() {}

  ngOnDestroy(): void {
    this.modal.destroy?.();
  }

  ngAfterViewInit(): void {
    this.modal = MaterialService.initModal(this.modalRef);
  }

  selectOrder(order: Order) {
    this.selectedOrder = order;
    this.modal.open?.();
  }

  closeModal() {
    this.modal.close?.();
  }

  computePrice(order: Order): number {
    return order.list.reduce((total, item) => {
      return (total += item.quantity * item.cost);
    }, 0);
  }
}
