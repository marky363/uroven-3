import { SafeUrl } from '@angular/platform-browser';

export class Category {
  constructor(
    public name: string,
    public img: SafeUrl,
    public galleryLenght?: number,
    public galleryPath?: string,
    public gallery?: GalleryResposnePic[],
    public empty?: boolean,
    public id?: number,
  ) {}
}

export class GalleryResponse {
  constructor(
    public gallery: {
      path: string;
      name: string;
    },
    public images: GalleryResposnePic[]
  ) {}
}
export class GalleryResposnePic {
  constructor(
    public fullpath: string,
    public modifed: string,
    public name: string,
    public path: string,
    public imgURL?: SafeUrl
  ) {}
}
export class Uploaded {
  constructor(public uploaded: GalleryResposnePic[]) {}
}

export class Galleries {
  constructor(
    public name: string,
    public path: string,
    public image: {
      fullpath: string;
      modified: string;
      name: string;
      path: string;
    }
  ) {}
}

export class Files {
  constructor(public photos: File, public url: SafeUrl) {}
}
export class Error {
  constructor(public ok: boolean, public status: number, public url: string) {}
}
