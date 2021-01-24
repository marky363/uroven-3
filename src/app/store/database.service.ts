import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Galleries,
  GalleryResponse,
  GalleryResposnePic,
} from '../shared/category.model';
import { environment } from '../../environments/environment';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { of, Subject, throwError } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as GalleryActions from '../store/gallery.actions';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private apiUrl = environment.apiUrl;

  fetchGalleries() {
    return this.http.get<Galleries[][]>(this.apiUrl + '/gallery').pipe(
      map((data) => {
        var data = Object.values(data);
        return data[0];
      })
    );
  }
  fetchGallery(path) {
    return this.http
      .get<GalleryResponse>(this.apiUrl + '/gallery/' + path)
      .pipe();
  }

  fetchPicturesCustomWidth(path, width) {
    return this.http
      .get(this.apiUrl + '/images/' + width + 'x0/' + path, {
        responseType: 'blob',
      })
      .pipe(
        map(
          (res) => this.getPicutre(res),
          catchError((error) => {
            console.log(error);
            return of('');
          })
        )
      );
  }

  postCategory(name) {
    return this.http.post(this.apiUrl + '/gallery', {
      name: name,
    });
  }

  fetchGalleryAndGeneratePictures(path) {
    let sub = new Subject<boolean>();
    this.fetchGallery(path)
      .pipe(
        takeUntil(sub),
        tap((res) => {
          let counter = 0;
          if (res.images.length === 0) {
            sub.next(true);
          }
          res.images.map((gallery) => {
            this.fetchPicturesCustomWidth(gallery.fullpath, 250)
              .pipe(
                catchError((err) => {
                  ++counter;
                  return throwError(err);
                })
              )
              .subscribe(
                (img) => {
                  ++counter;
                  if (counter == res.images.length) {
                    sub.next(true);
                  }

                  let image = new GalleryResposnePic(
                    gallery.fullpath,
                    gallery.modifed,
                    gallery.name,
                    gallery.path,
                    img
                  );

                  this.store.dispatch(
                    new GalleryActions.AddImageToCategory({
                      galleryPath: res.gallery.path,
                      image: image,
                      fullsize: false,
                    })
                  );
                },
                (error) => {
                  console.warn('API: Image Error: \n' + error.url);
                }
              );
          });
        }),
        catchError((err) => throwError(''))
      )
      .subscribe();

    return sub;
  }
  fetchGalleryAndGeneratePicturesFullSize(path, width) {
    return this.fetchGallery(path).pipe(
      map((res) => {
        res.images.map((gallery) => {
          this.fetchPicturesCustomWidth(gallery.fullpath, width)
            .pipe(catchError((err) => throwError(err)))
            .subscribe(
              (img) => {
                let image = new GalleryResposnePic(
                  gallery.fullpath,
                  gallery.modifed,
                  gallery.name,
                  gallery.path,
                  img
                );

                this.store.dispatch(
                  new GalleryActions.AddImageToCategory({
                    galleryPath: res.gallery.path,
                    image: image,
                    fullsize: true,
                  })
                );
              },
              (error) => {
                console.warn('API: Image Error: \n' + error.url);
              }
            );
        });
        return { sended: true };
      })
    );
  }

  uploadPhotos(image: FormData, path: string) {
    return this.http
      .post(this.apiUrl + '/gallery/' + path, image)
      .pipe(catchError((error) => throwError(error)));
  }

  removePath(path) {
    return this.http.delete(this.apiUrl + '/gallery/' + path);
  }

  private getPicutre(img) {
    const unsafeImg = URL.createObjectURL(img);
    const picture = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
    return picture;
  }

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private store: Store<fromApp.AppState>
  ) {}
}
