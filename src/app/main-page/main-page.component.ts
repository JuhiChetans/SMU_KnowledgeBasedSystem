import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent {

  constructor(private router: Router) {};

  // faq(questionNo:any) {
  //   this.router.navigate(['/get-graph']);
  // }

  faq(questionNo: any) {
    console.log(questionNo);
    this.router.navigate(['kbs/faqa', questionNo]);
  }

}
