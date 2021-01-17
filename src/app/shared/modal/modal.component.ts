import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Files, GalleryResposnePic } from '../category.model';
import * as fromApp from '../../store/app.reducer';
import * as GalleryActions from '../../store/gallery.actions';
import { Store } from '@ngrx/store';
import { NgForm } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.sass'],
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input('action') action: string;
  @Input('gallery') gallery: GalleryResposnePic[];
  @Input('index') index: number = 0;

  @Input('error') error: string = '';

  @Output('close') onClose = new EventEmitter<void>();

  constructor(
    private store: Store<fromApp.AppState>,
    private sanitizer: DomSanitizer
  ) {}

  ngOnDestroy() {
    this.store.dispatch(new GalleryActions.Error(''));
  }
  ngOnInit(): void {
    setTimeout(() => {
      this.onClose.emit();
    }, 200000000);
  }
  close() {
    this.onClose.emit();
    this.error = '';
  }

  addNewCategory(string: NgForm) {
    this.error = '';

    this.store.dispatch(new GalleryActions.PostGallery(string.value.category));
    this.store.dispatch(new GalleryActions.Error(''));

    this.onClose.emit();
  }

  photosToUpload(photos: File[]) {
    let files: Files[] = [];
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const url = this.sanitizer.bypassSecurityTrustUrl(
        window.URL.createObjectURL(photo)
      );
      let file = new Files(photo, url);
      files.push(file);
    }
    this.store.dispatch(new GalleryActions.PostPhotos(files));
  }
}
