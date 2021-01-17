
import { ActionReducerMap } from '@ngrx/store';

import * as fromGallery from "./gallery.reducer"

export interface AppState { 
   galleryList: fromGallery.State
}

export const appReducer: ActionReducerMap<AppState> = {
   galleryList: fromGallery.GalleryReducer
}