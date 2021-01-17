import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as GalleryActions from '../store/gallery.actions';

import { Category } from '../shared/category.model';
import { Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass'],
})
export class HeaderComponent implements OnInit {
  selectedCategory: Category;
  categoryName: string;

  bgUrl: SafeUrl = '../assets/pexels-photo-261187.jpeg';

  constructor(private store: Store<fromApp.AppState>, private router: Router) {}

  ngOnInit(): void {
    this.store.select('galleryList').subscribe((state) => {
      this.categoryName = state.openedCategory;
     
      
    });
  }

  backToCategories() {
    this.router.navigate(['']);
    this.store.dispatch(new GalleryActions.OpenGallery(''));
  }
}
