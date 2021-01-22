import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Galleries,
  GalleryResponse,
  GalleryResposnePic,
} from '../shared/category.model';
import { catchError, map } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as GalleryActions from '../store/gallery.actions';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {

  apiUrl = "http://api.programator.sk";

  fetchGalleries() {
    return this.http
      .get<Galleries[][]>('http://api.programator.sk/gallery')
      .pipe(
        map((data) => {
          var data = Object.values(data);
          return data[0];
        })
      );
  }
  fetchGallery(path) {
    return this.http
      .get<GalleryResponse>('http://api.programator.sk/gallery/' + path)
      .pipe();
  }

  fetchPictures(path) {
    return this.http
      .get('http://api.programator.sk/images/300x0/' + path, {
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
  fetchPicturesCustomWidth(path, width) {
    return this.http
      .get('http://api.programator.sk/images/' + width + 'x0/' + path, {
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
    return this.http.post('http://api.programator.sk/gallery', {
      name: name,
    });
  }

  fetchGalleryAndGeneratePictures(path) {
    return this.fetchGallery(path).pipe(
      map((res) => {
        return res.images.map((gallery) => {
          this.fetchPictures(gallery.fullpath)
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
                    fullsize: false,
                  })
                );
              },
              (error) => {
                console.warn('API: Image Error: \n' + error.url);
              }
            );
          return { loaded: true };
        });
      })
    );
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
      .post('http://api.programator.sk/gallery/' + path, image)
      .pipe(catchError((error) => throwError(error)));
  }

  removePath(path) {
    return this.http.delete('http://api.programator.sk/gallery/' + path);
  }
  removeErrorImage(path) {
    return this.http.delete(path);
  }

  getPicutre(img) {
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

export const HandleError = (errorRes: any, action?) => {
  let errorMessage = 'An unknow error!';

  switch (errorRes.error.code || errorRes.status) {
    case 400:
      errorMessage = 'Chybne zadaný request';
      break;
    case 404:
      errorMessage = 'Galéria pre upload sa nenašla';
      break;

    default:
      errorMessage = 'An unknow error!';
  }

  return of(new GalleryActions.Error(errorMessage));
};
