import { Component, Injectable, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as GalleryActions from '../store/gallery.actions';

import { Category } from '../shared/category.model';
import { Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';
import { BehaviorSubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BgService {
  constructor() {}

  BgUrl = new BehaviorSubject<SafeUrl>('../assets/pexels-photo-261187.jpeg');
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass'],
})
export class HeaderComponent implements OnInit {
  selectedCategory: Category;
  categoryName: string;

  constructor(private store: Store<fromApp.AppState>, private router: Router) {}

  ngOnInit(): void {
    this.store.select('galleryList').pipe(map(state => state.openedCategory)).subscribe((state) => {
      this.categoryName = state;
    });
  }

  backToCategories() {
    this.router.navigate(['']);
    this.store.dispatch(new GalleryActions.OpenGallery(''));
  }
}
