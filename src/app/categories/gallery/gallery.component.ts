import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BgService } from 'src/app/shared/bgchange.service';
import { GalleryResposnePic } from 'src/app/shared/category.model';

import * as fromApp from '../../store/app.reducer';
import * as GalleryActions from '../../store/gallery.actions';

import { NgxSpinnerService } from 'ngx-bootstrap-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.sass'],
})
export class GalleryComponent implements OnInit, OnDestroy {
  images: GalleryResposnePic[] = [];
  route: string;
  error: string = '';

  sub: Subscription;
  constructor(
    private store: Store<fromApp.AppState>,
    private ActivatedRoute: ActivatedRoute,
    private BG: BgService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  ngOnInit(): void {
    this.spinner.show();
    this.ActivatedRoute.params.subscribe((data) => {
      this.route = data.name;
      this.store.dispatch(new GalleryActions.OpenGallery(this.route));
    });

    this.sub = this.store.select('galleryList').subscribe((state) => {
     
      var images = state.categories.find(
        (gallery) => gallery.name == this.route
      );

      if (images) {
        this.images = images.gallery;

        if (images.empty == true) {
          this.spinner.hide();
        } else {
          if (images.gallery[0]) {
            this.spinner.hide();
            this.BG.BgUrl.next(images.gallery[0].imgURL);
          }
        }
      }

      if (state.loading == false && !images) {
        this.spinner.hide();
        this.spinner.show('redirecting');
        setTimeout(() => {
          this.spinner.hide('redirecting');
          this.router.navigate(['']);
          this.store.dispatch(new GalleryActions.OpenGallery(''));
        }, 1500);
      }


      if (state.error) {
        this.error = state.error;
        this.openedModal = true;
      } else {
        this.error = '';
      }
    });


  }

  openedModal: boolean = false;
  action = 'addPhotos';
  openModalAddPhotos() {
    this.openedModal = !this.openedModal;
  }

  openedGallery: boolean = false;
  gallery = 'gallery';
  indexInGallery: number = 0;
  openGallery(index) {
    this.indexInGallery = index;
    this.openedGallery = !this.openedGallery;
  }

  removePhoto(path) {
    this.store.dispatch(new GalleryActions.RemoveFromDb(path));
  }
}
