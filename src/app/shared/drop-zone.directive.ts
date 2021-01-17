import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Output,
} from '@angular/core';

@Directive({
  selector: '[DropZone]',
})
export class DropZoneDirective {
  @Output('photos') files: EventEmitter<any[]> = new EventEmitter();

  @HostBinding('style.border-color') public border = '#eeeeee';

  constructor() {}

  @HostListener('dragover', ['$event']) public onDragOver(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.border = '#aaaaaa';
  }
  @HostListener('dragleave', ['$event']) public onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.border = '#eeeeee';
  }
  @HostListener('drop', ['$event']) public onDrop(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.border = '#eee';
    let files: any[] = [];
    for (let i = 0; i < evt.dataTransfer.files.length; i++) {
      const photo = evt.dataTransfer.files[i];

      files.push(photo);
    }
    if (files.length > 0) {
      this.files.emit(files);
    }
  }
}
