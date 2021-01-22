import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Files, GalleryResposnePic } from '../category.model';
import * as fromApp from '../../store/app.reducer';
import * as GalleryActions from '../../store/gallery.actions';
import { Store } from '@ngrx/store';
import { NgForm } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { catchError } from 'rxjs/operators';
import { DatabaseService } from 'src/app/store/database.service';
import { config, Observable, throwError } from 'rxjs';
import { SubSink } from 'subsink';

import { NgbCarousel } from '@ng-bootstrap/ng-bootstrap';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input('action') action: string;
  

  galery$: Observable<GalleryResposnePic[]>;
  @Input('galleryID') idCategory: number = 0;
  @Input('index') index: any = 0;


  @Input('error') error: string = '';

  @Output('close') onClose = new EventEmitter<void>();

  @HostListener('document:keydown.escape', ['$event']) public onESC(
    evt: KeyboardEvent
  ) {
    evt.preventDefault();
    evt.stopPropagation();

    this.close();
  }
  @ViewChild('carousel') carousel: NgbCarousel;

  ngAfterViewInit() {
    if(this.action == "gallery"){
      this.carousel.pause();
      this.carousel.focus();
   
    }
   
  }


  subs = new SubSink();

  constructor(
    private store: Store<fromApp.AppState>,
    private sanitizer: DomSanitizer,
    private db: DatabaseService
  ) {}

  ngOnDestroy() {
    if (this.error) {
      this.store.dispatch(new GalleryActions.Error(''));
    }

    this.subs.unsubscribe();
  }
  ngOnInit(): void {
    this.galery$ = this.store.select(
      (state) => state.galleryList.categories[this.idCategory].gallery
    );

    this.subs.sink = this.store.select('galleryList').subscribe((state) => {
      this.error = state.error;
    });
  }

  close() {
    this.onClose.emit();
    this.error = '';
  }
  addNewCategory(string: NgForm) {
    this.error = '';

    this.subs.sink = this.db
      .postCategory(string.value.category)
      .pipe(catchError((err) => throwError(err)))
      .subscribe(
        (res) => {
          this.store.dispatch(
            new GalleryActions.PostGallery(string.value.category)
          );
          this.onClose.emit();
        },
        () => {
          this.error =
            'Galéria so zadaným názvom  "' +
            string.value.category +
            '" už existuje';
        }
      );
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
