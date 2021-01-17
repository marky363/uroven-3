import { SafeUrl } from '@angular/platform-browser';
import { Action } from '@ngrx/store';
import { Category, Files, GalleryResposnePic } from '../shared/category.model';

export const OPEN_GALLERY = '[Gallery] Open Gallery';

export const LOADING_END = ' [Gallery] Loaded all categories';

export const FETCH_GALLERIES = '[Gallery] Fetch Galleries';
export const PUSH_CATEGORY = '[Gallery] Pushing Gallery to app';

export const POST_GALLERY = '[Gallery] Pushing Gallery to db';
export const POST_PHOTOS = '[Gallery] Pushing Photos to db';
export const REMOVE = '[Gallery] Remove from db';

export const CREATE_TEMPORARY_IMAGE = '[Gallery] Creating tmp image';

export const ADD_IMAGE_TO_CATEGORY = '[Gallery] Adding image to cat';

export const ERROR = '[Gallery] Error';

export class OpenGallery implements Action {
  readonly type = OPEN_GALLERY;

  constructor(public payload: string) {}
}

export class FetchGalleries implements Action {
  readonly type = FETCH_GALLERIES;
}
export class PushCategory implements Action {
  readonly type = PUSH_CATEGORY;

  constructor(public payload: Category) {}
}

export class AddImageToCategory implements Action {
  readonly type = ADD_IMAGE_TO_CATEGORY;

  constructor(
    public payload: { galleryPath: string; image: GalleryResposnePic }
  ) {}
}

export class Error implements Action {
  readonly type = ERROR;

  constructor(public payload: string) {}
}
export class LoadedEnd implements Action {
  readonly type = LOADING_END;
}
export class RemoveFromDb implements Action {
  readonly type = REMOVE;
  constructor(public payload: string) {}
}

export class PostGallery implements Action {
  readonly type = POST_GALLERY;

  constructor(public payload: string) {}
}
export class PostPhotos implements Action {
  readonly type = POST_PHOTOS;

  constructor(public payload: Files[]) {}
}

export type CategoryActions =
  | OpenGallery
  | PushCategory
  | AddImageToCategory
  | Error
  | LoadedEnd
  | PostGallery
  | PostPhotos
  | RemoveFromDb;
