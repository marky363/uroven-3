import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as GalleryActions from './store/gallery.actions';
import * as fromApp from './store/app.reducer';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent implements OnInit {
  ngOnInit() {
    this.store.dispatch(new GalleryActions.FetchGalleries());
  }
  constructor(private store: Store<fromApp.AppState>) {}
}
