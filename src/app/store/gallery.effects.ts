import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
  catchError,
  map,
  mergeMap,
  switchMap,
  take,
  withLatestFrom,
} from 'rxjs/operators';
import { DatabaseService } from './database.service';
import * as GalleryActions from './gallery.actions';
import * as fromApp from '../store/app.reducer';

import {
  Category,
  Error,
  Galleries,
  GalleryResposnePic,
  Uploaded,
} from '../shared/category.model';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, of, throwError } from 'rxjs';

@Injectable()
export class GalleryEffects {
  loadedMainTHumbs = new BehaviorSubject<boolean>(false);

  @Effect({ dispatch: false })
  fetchGalleries = this.actions$.pipe(
    ofType(GalleryActions.FETCH_GALLERIES),
    switchMap(() => {
      return this.database.fetchGalleries();
    }),
    map((res: Galleries[]) => {
      let counter: number = 0;
      let thumbCounter: number = 0;

      res.forEach((data) => {
        if (data.path.length < 15 && data.image != undefined) {
          let category = new Category(
            data.name,
            '',
            length,
            data.path,
            [],
            false
          );
          this.store.dispatch(
            new GalleryActions.PushCategory({
              category: category,
              update: false,
            })
          );
          ++counter;
          if (counter == res.length - 1) {
            this.store.dispatch(new GalleryActions.LoadedEnd());
          }

          this.database
            .fetchPicturesCustomWidth(data.image.fullpath, 800)
            .pipe(
              mergeMap((picture) => {
                return combineLatest([
                  of(picture),
                  this.database.fetchGallery(data.path),
                ]);
              }),
              catchError((error) => throwError(error))
            )
            .subscribe(
              ([img, gallery]) => {
                ++thumbCounter;
                if (thumbCounter == res.length - 1) {
                  this.loadedMainTHumbs.next(true);
                }
                let length = gallery.images.length;
                let category = new Category(
                  data.name,
                  img,
                  length,
                  data.path,
                  [],
                  false
                );
                this.store.dispatch(
                  new GalleryActions.PushCategory({
                    category: category,
                    update: true,
                  })
                );
              },
              (error: Error) => {
                console.warn('API Image Error: \n' + error.url);
                let category = new Category(
                  data.name,
                  '',
                  0,
                  data.path,
                  [],
                  true
                );
                if (category.name.length < 20) {
                  this.store.dispatch(
                    new GalleryActions.PushCategory({
                      category: category,
                      update: true,
                    })
                  );
                }
              }
            );
        } else {
          let category = new Category(data.name, '', 0, data.path, [], true);
          if (category.name.length < 20) {
            this.store.dispatch(
              new GalleryActions.PushCategory({
                category: category,
                update: false,
              })
            );
            ++counter;
            ++thumbCounter;
            if (counter == res.length - 1) {
              this.store.dispatch(new GalleryActions.LoadedEnd());
            }
          }
        }
      });
    })
  );

  @Effect({ dispatch: false })
  loadThumb = this.actions$.pipe(
    ofType(GalleryActions.LOADING_END),
    switchMap(() => this.store.select('galleryList').pipe(take(1))),
    map((state) => {
      if (
        state.openedCategory &&
        state.categories.find((cat) => cat.name == state.openedCategory)
      ) {
        this.database
          .fetchGalleryAndGeneratePictures(state.openedCategory)
          .pipe(
            mergeMap((res) => combineLatest([of(res), this.loadedMainTHumbs])),
            catchError((err) => throwError(err))
          )
          .subscribe(
            ([data, loaded]) => {
              if (data) {
                this.database
                  .fetchGalleryAndGeneratePicturesFullSize(
                    state.openedCategory,
                    1500
                  )
                  .subscribe();
                if (loaded) {
                  state.categories.forEach((gallery) => {
                    if (state.openedCategory != gallery.name) {
                      this.database
                        .fetchGalleryAndGeneratePictures(gallery.galleryPath)
                        .subscribe((res) => {
                          this.database
                            .fetchGalleryAndGeneratePicturesFullSize(
                              gallery.galleryPath,
                              1500
                            )
                            .subscribe();
                        });
                    }
                  });
                }
              }
            },
            (error) => {
              this.loadedMainTHumbs
                .pipe(map((loaded) => loaded == true))
                .subscribe((loaded) => {
                  if (loaded) {
                    state.categories.forEach((gallery) => {
                      this.database
                        .fetchGalleryAndGeneratePictures(gallery.galleryPath)
                        .subscribe((res) => {
                          if (res) {
                            this.database
                              .fetchGalleryAndGeneratePicturesFullSize(
                                gallery.galleryPath,
                                1500
                              )
                              .subscribe();
                          }
                        });
                    });
                  }
                });
            }
          );
      } else {
        this.loadedMainTHumbs.subscribe((loaded) => {
          if (loaded) {
            state.categories.forEach((gallery) => {
              this.database
                .fetchGalleryAndGeneratePictures(gallery.galleryPath)
                .subscribe((res) => {
                  if (res) {
                    this.database
                      .fetchGalleryAndGeneratePicturesFullSize(
                        gallery.galleryPath,
                        1500
                      )
                      .subscribe();
                  }
                });
            });
          }
        });
      }
    })
  );

  @Effect({ dispatch: false })
  removefromDB = this.actions$.pipe(
    ofType(GalleryActions.REMOVE),
    map((action: GalleryActions.RemoveFromDb) => action.payload),
    switchMap((payload) => {
      return this.database.removePath(payload);
    })
  );
  @Effect({ dispatch: false })
  postPhotos = this.actions$.pipe(
    ofType(GalleryActions.POST_PHOTOS),
    map((action: GalleryActions.PostPhotos) => action.payload),
    withLatestFrom(this.store.select('galleryList')),
    map(([payload, state]) => {
      const SelectedGallery = state.categories.find(
        (gallery) => gallery.name == state.openedCategory
      );

      payload.forEach((image) => {
        const formData: FormData = new FormData();
        formData.append('', image.photos, image.photos.name);

        this.database
          .uploadPhotos(formData, SelectedGallery.galleryPath)
          .subscribe((res: Uploaded) => {
            this.database
              .fetchPicturesCustomWidth(res.uploaded[0].fullpath, 1500)
              .subscribe(
                (img) => {
                  let image = new GalleryResposnePic(
                    res.uploaded[0].fullpath,
                    res.uploaded[0].modifed,
                    res.uploaded[0].name,
                    res.uploaded[0].path,
                    img
                  );
                  this.store.dispatch(
                    new GalleryActions.AddImageToCategory({
                      galleryPath: state.openedCategory,
                      image: image,
                      fullsize: false,
                    })
                  );
                },
                (error) => {
                  this.database
                    .removePath(res.uploaded[0].fullpath)
                    .subscribe((res) => {});

                  this.store.dispatch(
                    new GalleryActions.Error(
                      'Chyba servera nahrajte inú fotku ako: ' +
                        res.uploaded[0].name
                    )
                  );
                }
              );
          });
      });
    })
  );

  constructor(
    private actions$: Actions,
    private database: DatabaseService,
    private store: Store<fromApp.AppState>
  ) {}
}
