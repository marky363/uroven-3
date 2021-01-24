import { Directive, HostBinding, OnDestroy } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { BgService } from '../header/header.component';

@Directive({
  selector: '[Bgchange]',
})
export class BgchangeDirective implements OnDestroy {
  @HostBinding('src') public bg_src: SafeUrl =
    '../assets/pexels-photo-261187.jpeg';

  @HostBinding('style.animation-name') public bgAnimation = 'newBG';

  sub: Subscription;
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  constructor(private BG: BgService) {
    this.sub = this.BG.BgUrl.pipe(
      debounceTime(400),
      tap((bg) => {
        if (bg != this.bg_src) {
          this.bgAnimation = 'oldBG';
        }
      }),
      debounceTime(200)
    ).subscribe((bg) => {
      if (bg != this.bg_src) {
        this.bg_src = bg;
        this.bgAnimation = 'newBG';
      }
    });
  }
}
