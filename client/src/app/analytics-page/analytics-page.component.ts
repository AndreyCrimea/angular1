import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { response } from 'express';
import { Subscription } from 'rxjs';
import { AnalyticsPage } from '../shared/interfaces';
import { AnalyticsService } from '../shared/services/analytics.service';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.scss'],
})
export class AnalyticsPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gain') gainRef!: ElementRef;
  @ViewChild('order') orderRef!: ElementRef;

  aSub!: Subscription;
  average: Number = 0;
  pending = true;

  constructor(private service: AnalyticsService) {}

  ngAfterViewInit(): void {
    const gainConfig: any = {
      label: 'Выручка',
      color: 'rgb(255, 99, 132)',
    };
    const orderConfig: any = {
      label: 'Заказы',
      color: 'rgb(54, 162, 235)',
    };

    this.aSub = this.service.getAnalytics().subscribe((data: AnalyticsPage) => {
      this.pending = false;

      gainConfig.labels = data.chart.map((item) => {
        return item.label;
      });
      gainConfig.data = data.chart.map((item) => {
        return item.gain;
      });

      orderConfig.labels = data.chart.map((item) => {
        return item.label;
      });
      orderConfig.data = data.chart.map((item) => {
        return item.order;
      });

      // **** temp ****
      // gainConfig.labels.push('15.10.2022');
      // gainConfig.data.push(150000);
      // gainConfig.labels.push('16.10.2022');
      // gainConfig.data.push(1780000);
      // gainConfig.labels.push('17.10.2022');
      // gainConfig.data.push(10000000);
      // gainConfig.labels.push('18.10.2022');
      // gainConfig.data.push(750000);
      // gainConfig.labels.push('19.10.2022');
      // gainConfig.data.push(3570000);
      // **** temp ****

      const gainCtx = this.gainRef.nativeElement.getContext('2d');
      const orderCtx = this.orderRef.nativeElement.getContext('2d');
      gainCtx.canvas.height = '300px';
      orderCtx.canvas.height = '300px';

      Chart.register(...registerables);

      new Chart(gainCtx, this.createChartConfig(gainConfig) as any);
      new Chart(orderCtx, this.createChartConfig(orderConfig) as any);

      this.average = data.average;
    });
  }

  ngOnDestroy(): void {
    if (this.aSub) {
      this.aSub.unsubscribe();
    }
  }

  createChartConfig({
    label,
    data,
    labels,
    color,
  }: {
    label: string;
    data: any;
    labels: any;
    color: string;
  }) {
    return {
      type: 'line',
      options: {
        responsive: true,
      },
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            borderColor: color,
            steppedLine: false,
            fill: false,
          },
        ],
      },
    };
  }
}
