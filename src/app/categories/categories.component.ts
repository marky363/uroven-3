import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { Subscription } from 'rxjs';
import { BgService } from '../shared/bgchange.service';

import { Category } from '../shared/category.model';
import * as fromApp from '../store/app.reducer';
import * as GalleryActions from '../store/gallery.actions';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.sass'],
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  openedGallery: number;
  loading: boolean = true;
  error: string = '';

  sub: Subscription;

  constructor(
    private store: Store<fromApp.AppState>,
    private router: Router,
    private BG: BgService
  ) {}

  ngOnInit(): void {
    this.sub = this.store.select('galleryList').subscribe((state) => {
      this.categories = state.categories;

      this.loading = state.loading;
      if (state.error) {
        this.error = state.error;
        this.openedModal = true;
      } else {
        this.error = '';
      }
    });
  }

  openGallery(category: Category, navigated?: boolean) {
    if (!navigated) {
      this.router.navigate(['/gallery/' + category.name]);
    }
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
  action = 'addCategory';
  openModalAddCategory() {
    
    this.openedModal = !this.openedModal;
  }
}
