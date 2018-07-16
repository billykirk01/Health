import { Component, ViewChild, ElementRef, } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Chart } from 'chart.js';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable, Subject } from 'rxjs';

import { last } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private db: AngularFirestore, private breakpointObserver: BreakpointObserver) { }

  @ViewChild('canvasOne') canvasOne: ElementRef;
  chartOne = [];

  @ViewChild('canvasTwo') canvasTwo: ElementRef;
  chartTwo = [];

  onMobile: boolean

  days: Observable<any[]>;

  private recentDoc: AngularFirestoreDocument<any>;
  recent: Observable<any>;

  private weightDoc: AngularFirestoreDocument<any>;
  weight: Observable<any>;

  currentDay: any;
  currentDayIndex: number = 0;

  testIndex: Subject<any>

  updatedTime: any;

  ngOnInit(): void {

    this.breakpointObserver.observe([
      Breakpoints.HandsetLandscape,
      Breakpoints.HandsetPortrait
    ]).subscribe(result => {
      if (result.matches) {
        this.onMobile = true
      } else {
        this.onMobile = false
      }
    });

    this.recentDoc = this.db.doc<any>('recent/totals');
    this.recent = this.recentDoc.valueChanges();
    this.recent.subscribe(ary => {
      this.updatedTime = new Date((ary.updated.seconds + 18000) * 1000)
      this.chartOne = new Chart(this.canvasOne.nativeElement.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ary.dates,
          datasets: [{
            label: 'Calories',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
            stack: 'Stack 0',
            yAxisID: 'y-axis-1',
            data: ary.calories
          }, {
            label: 'Carbohydrates',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            stack: 'Stack 1',
            yAxisID: 'y-axis-2',
            data: ary.carbohydrates
          }, {
            label: 'Protein',
            backgroundColor: 'rgba(88, 214, 141, 0.2)',
            borderColor: 'rgba(88, 214, 141, 1)',
            borderWidth: 1,
            stack: 'Stack 1',
            yAxisID: 'y-axis-2',
            data: ary.protein
          },
          {
            label: 'Fat',
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
            stack: 'Stack 1',
            yAxisID: 'y-axis-2',
            data: ary.fat
          }
          ]
        },
        options: {
          scales: {
            yAxes: [{
              id: 'y-axis-1',
              display: true,
              position: 'left',
              beginAtZero: false,
              gridLines: {
                display: false
              }
            }, {
              id: 'y-axis-2',
              display: true,
              position: 'right',
              gridLines: {
                display: false
              }
            }]
          },
          legend: {
            display: false
          },
        }
      });

      this.testIndex = new Subject()

      this.days.subscribe(ary => {
        this.currentDay = ary[0]
        this.testIndex.subscribe(val => {
          this.currentDay = ary[val]
        })
      })

    })

    this.weightDoc = this.db.doc<any>('weight/totals');
    this.weight = this.weightDoc.valueChanges();
    this.weight.subscribe(ary => {
      this.chartOne = new Chart(this.canvasTwo.nativeElement.getContext('2d'), {
        type: 'line',
        data: {
          labels: ary.dates,
          datasets: [{
            label: 'Weight',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
            data: ary.weights
          }]
        },
        options: {
          scales: {
            yAxes: [{
              display: true,
              position: 'left',
              beginAtZero: false,
              suggestedMin: 180,
              gridLines: {
                display: false
              }
            }],
            xAxes: [{
              display: true,
              ticks: {
                // remove label from axis
                callback: function (value, index, values) {
                  return null;
                }
              }
            }]
          },
          legend: {
            display: false
          },
          responsive: true,
          maintainAspectRatio: false
        }
      });

    })


    this.days = this.db.collection('nutrition', ref => ref.orderBy('date', 'desc').limit(5)).valueChanges()

  }

  decrementCurrentDay() {

    if (this.currentDayIndex < 4) {
      this.currentDayIndex = this.currentDayIndex + 1
      console.log(this.currentDayIndex)
      this.testIndex.next(this.currentDayIndex)
    }
  }

  incrementCurrentDay() {
    console.log(this.currentDayIndex)
    if (this.currentDayIndex > 0) {
      this.currentDayIndex = this.currentDayIndex - 1
      this.testIndex.next(this.currentDayIndex)
    }
  }
}

export interface Day {
  date: string;
}

export interface lastSeven {
  calories: [number]
}