import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { Subscription } from 'rxjs';

import { BgService } from "../header/header.component"

import { Category } from '../shared/category.model';
import * as fromApp from '../store/app.reducer';
import * as GalleryActions from '../store/gallery.actions';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.sass'],
})
export class CategoriesComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  openedGallery: number;
  loading: boolean = true;
  error: string = '';

  sub: Subscription;

  constructor(
    private store: Store<fromApp.AppState>,
    private BG: BgService
  ) {}

  ngOnInit(): void {
    this.sub = this.store.select('galleryList').subscribe((state) => {
      this.categories = state.categories;

      this.loading = state.loading;
    });
  }

 
  changeBg(imgUrl) {
    if (imgUrl != '') {
      this.BG.BgUrl.next(imgUrl);
    }
  }

  removeGallery(path) {
    this.store.dispatch(new GalleryActions.RemoveFromDb(path));
  }

  openedModal: boolean = false;
  openModalAddCategory() {
    this.openedModal = !this.openedModal;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
