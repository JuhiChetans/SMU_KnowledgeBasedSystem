import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
// import { VisModule } from 'ngx-vis/ngx-vis';
import { GraphComponent } from './graph/graph.component';
import { MainPageComponent } from './main-page/main-page.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';


const appRoutes: Routes = [
  { path: 'kbs',  component: MainPageComponent },
  { path: 'kbs/faqa/:questionNo', component: GraphComponent },
  { path: '',   redirectTo: '/kbs', pathMatch: 'full' },

]


@NgModule({
  declarations: [
    AppComponent,
    GraphComponent,
    MainPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    RouterModule.forRoot(
      appRoutes,
      // { enableTracing: true } // <-- debugging purposes only
    )
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
