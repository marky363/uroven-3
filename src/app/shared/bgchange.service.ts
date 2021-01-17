import { Injectable } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BgService {

  constructor() { }


  BgUrl = new Subject<SafeUrl>();

  
}
