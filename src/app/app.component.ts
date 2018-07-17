import { Component, ViewChild, ElementRef, } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Chart } from 'chart.js';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable, Subject } from 'rxjs';


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

  @ViewChild('canvasThree') canvasThree: ElementRef;
  chartThree = [];

  onMobile: boolean
  weekView: boolean = true

  days: Observable<any[]>;

  private recentDoc: AngularFirestoreDocument<any>;
  recent: Observable<any>;

  private weightDoc: AngularFirestoreDocument<any>;
  weight: Observable<any>;

  currentDay: any;
  currentDayIndex: number = 0;
  scratchIndex: Subject<any> = new Subject()
  recentAverages: any;

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
      this.recentAverages = ary.averages
      this.updatedTime = new Date((ary.updated.seconds + 18000) * 1000)
      this.chartOne = new Chart(this.canvasOne.nativeElement.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ary.dates.slice(-7, -1),
          datasets: [{
            label: 'Calories',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
            stack: 'Stack 0',
            yAxisID: 'y-axis-1',
            data: ary.calories.slice(-7, -1)
          }, {
            label: 'Carbohydrates (g)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            stack: 'Stack 1',
            yAxisID: 'y-axis-2',
            data: ary.carbohydrates.slice(-7, -1)
          }, {
            label: 'Protein (g)',
            backgroundColor: 'rgba(88, 214, 141, 0.2)',
            borderColor: 'rgba(88, 214, 141, 1)',
            borderWidth: 1,
            stack: 'Stack 1',
            yAxisID: 'y-axis-2',
            data: ary.protein.slice(-7, -1)
          },
          {
            label: 'Fat (g)',
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
            stack: 'Stack 1',
            yAxisID: 'y-axis-2',
            data: ary.fat.slice(-7, -1)
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
            display: true,
            position: 'bottom'
          },
          responsive: true,
          maintainAspectRatio: false
        }
      });

      this.chartTwo = new Chart(this.canvasTwo.nativeElement.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ary.dates,
          datasets: [{
            label: 'Calories',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
            data: ary.calories
          }]
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
            display: true,
            position: 'bottom'
          },
          responsive: true,
          maintainAspectRatio: false
        }
      });

      this.days.subscribe(ary => {
        this.currentDay = ary[0]
        this.scratchIndex.subscribe(val => {
          this.currentDay = ary[val]
        })
      })

    })

    this.weightDoc = this.db.doc<any>('weight/totals');
    this.weight = this.weightDoc.valueChanges();
    this.weight.subscribe(ary => {
      this.chartThree = new Chart(this.canvasThree.nativeElement.getContext('2d'), {
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
              gridLines: {
                display: false
              },
              ticks: {
                userCallback: function (label, index, labels) {
                  // when the floored value is the same as the value we have a whole number
                  if (Math.floor(label) === label) {
                    return label;
                  }

                },
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

    this.days = this.db.collection('nutrition', ref => ref.orderBy('timestamp', 'desc').limit(7)).valueChanges()

  }

  decrementCurrentDay() {
    console.log(this.currentDayIndex)
    if (this.currentDayIndex < 4) {
      this.currentDayIndex = this.currentDayIndex + 1
      this.scratchIndex.next(this.currentDayIndex)
    }
  }

  incrementCurrentDay() {
    if (this.currentDayIndex > 0) {
      this.currentDayIndex = this.currentDayIndex - 1
      this.scratchIndex.next(this.currentDayIndex)
    }
  }

  setWeekView() {
    this.weekView = true
  }

  setMonthView() {
    this.weekView = false
  }
}