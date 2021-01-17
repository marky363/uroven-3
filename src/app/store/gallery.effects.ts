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
import { DatabaseService, HandleError } from './database.service';
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
import { combineLatest, of, throwError } from 'rxjs';

@Injectable()
export class GalleryEffects {
  @Effect({ dispatch: false })
  fetchGalleries = this.actions$.pipe(
    ofType(GalleryActions.FETCH_GALLERIES),
    switchMap(() => {
      return this.database.fetchGalleries();
    }),
    map((res: Galleries[]) => {
      let counter: number = 0;

      res.forEach((data) => {
        if (data.path.length < 15 && data.image != undefined) {
          this.database
            .fetchPictures(data.image.fullpath)
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
                let length = gallery.images.length;
                let category = new Category(data.name,img,length,data.path,[],false);
                this.store.dispatch(new GalleryActions.PushCategory(category));
                ++counter;
                if (counter == res.length - 1) {
                  this.store.dispatch(new GalleryActions.LoadedEnd());
                }
              },
              (error: Error) => {
                console.warn('API Image Error: \n' + error.url);
                let category = new Category(data.name,'',0,data.path,[],true);
                if (category.name.length < 20) {++counter;this.store.dispatch(new GalleryActions.PushCategory(category));
                if (counter == res.length - 1) {this.store.dispatch(new GalleryActions.LoadedEnd());}

                }}
            );
        } else {
                let category = new Category(data.name, '', 0, data.path, [], true);
                if (category.name.length < 20) {++counter;this.store.dispatch(new GalleryActions.PushCategory(category));
                if (counter == res.length - 1) {this.store.dispatch(new GalleryActions.LoadedEnd());
            }}
        }
      });
    })
  );

  @Effect({ dispatch: false })
  loadPhotos = this.actions$.pipe(
    ofType(GalleryActions.LOADING_END),
    switchMap(() => this.store.select('galleryList').pipe(take(1))),
    map((state) => {
      if (state.openedCategory) {
        this.database
          .fetchGalleryAndGeneratePictures(state.openedCategory)
          .pipe(catchError((err) => throwError('')))
          .subscribe(
            (data) => {
              if (data.loaded) {
                state.categories.forEach((gallery) => {
                  if (state.openedCategory != gallery.name) {
                    this.database
                      .fetchGalleryAndGeneratePictures(gallery.galleryPath)
                      .subscribe();
                  }
                });
              }
            },
            (error) => {
              state.categories.forEach((gallery) => {
                this.database
                  .fetchGalleryAndGeneratePictures(gallery.galleryPath)
                  .subscribe();
              });
            }
          );
      } else {
        state.categories.forEach((gallery) => {
          this.database
            .fetchGalleryAndGeneratePictures(gallery.galleryPath)
            .subscribe();
        });
      }
    })
  );

  @Effect()
  postCategory = this.actions$.pipe(
    ofType(GalleryActions.POST_GALLERY),
    map((action: GalleryActions.PostGallery) => action.payload),
    switchMap((payload) => {
      return this.database.postCategory(payload).pipe(
        map(() => {
          return new GalleryActions.Error('');
        }),
        catchError((error) => {
          return HandleError(error, payload);
        })
      );
    })
  );
  @Effect({ dispatch: false })
  removefromDB = this.actions$.pipe(
    ofType(GalleryActions.REMOVE),
    map((action: GalleryActions.RemoveFromDb) => action.payload),
    switchMap((payload) => {
      return this.database.removePath(payload);
    }),
    map((res) => {
      console.log(res);
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
            this.database.fetchPictures(res.uploaded[0].fullpath).subscribe(
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
