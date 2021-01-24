import {
  AfterViewInit,
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
import { Observable, throwError } from 'rxjs';
import { SubSink } from 'subsink';

import { NgbCarousel } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.sass'],
})
export class ModalComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input('action') action: string;

  galery$: Observable<GalleryResposnePic[]>;
  @Input('galleryID') idCategory: number = 0;
  @Input('index') index: any = 0;

  @Input('error') error: string = '';

  loading: boolean = false;

  @Output('close') onClose = new EventEmitter<void>();
  subs = new SubSink();

  @HostListener('document:keydown.escape', ['$event']) public onESC(
    evt: KeyboardEvent
  ) {
    evt.preventDefault();
    evt.stopPropagation();

    this.close();
  }
  @ViewChild('carousel') carousel: NgbCarousel;

  ngAfterViewInit() {
    if (this.action == 'gallery') {
      this.carousel.pause();
      this.carousel.focus();
    }
  }

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
      if (this.action === 'addPhotos') {
        this.error = state.error;
      }
    });
  }


  close() {
    this.onClose.emit();
    this.error = '';
  }

  @ViewChild('f') form: NgForm;

  addNewCategory() {
    this.error = '';
    let name = this.form.value.category;
    this.form.reset();
    this.loading = true;

    setTimeout(() => {
      if (this.loading) {
        this.error =
          'Nahravanie kategórie trva dlhšie ako normálne, prosim počkajte pokial sa nahrajú obrázky do galérie.. ';
      }
    }, 2500);

    this.subs.sink = this.db
      .postCategory(name)
      .pipe(catchError((err) => throwError(err)))
      .subscribe(
        (res) => {
          this.loading = false;
          this.store.dispatch(new GalleryActions.PostGallery(name));
          this.onClose.emit();
        },
        () => {
          this.loading = false;
          this.error = 'Galéria so zadaným názvom  "' + name + '" už existuje';
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
