import * as GalleryActions from './gallery.actions';
import { Category } from '../shared/category.model';

export interface State {
  categories: Category[];
  openedCategory: string;

  loading: boolean;
  error: string;
}

const initalState: State = {
  categories: [],
  openedCategory: '',
  loading: true,
  error: '',
};
export function GalleryReducer(
  state: State = initalState,
  action: GalleryActions.CategoryActions
) {
  switch (action.type) {
    case GalleryActions.OPEN_GALLERY:
      return {
        ...state,
        openedCategory: action.payload,
      };

    case GalleryActions.PUSH_CATEGORY:
      let category = action.payload;
      let newCategory = new Category(
        category.name,
        category.img,
        category.galleryLenght,
        category.galleryPath,
        category.gallery,
        category.empty,
        state.categories.length
      );

      return {
        ...state,
        categories: [...state.categories, newCategory],
      };

    case GalleryActions.POST_GALLERY:
      var copyState;

      const search = state.categories.find(
        (category) => category.name == action.payload
      );

      if (search) {
        if (search.name === action.payload) {
          copyState = [...state.categories];
        }
      } else {
        let newCategory = new Category(
          action.payload,
          '',
          0,
          action.payload,
          [],
          true,
          state.categories.length
        );

        copyState = [...state.categories, newCategory];
      }

      return {
        ...state,
        categories: copyState,
      };

    case GalleryActions.ADD_IMAGE_TO_CATEGORY:
      const copyOfCategories = [...state.categories];
      const findedCategory = copyOfCategories.find(
        (category) => category.galleryPath == action.payload.galleryPath
      );
      let updatedGallery;
      if (findedCategory.galleryLenght == 0) {
        updatedGallery = {
          ...findedCategory,
          img: action.payload.image.imgURL,
          galleryLenght: 1,
          gallery: [action.payload.image],
        };
      } else {
        let length = findedCategory.gallery.length;
        ++length;
        updatedGallery = {
          ...findedCategory,
          galleryLenght: length,
          gallery: [...findedCategory.gallery, action.payload.image],
        };
      }

      copyOfCategories[findedCategory.id] = updatedGallery;

      return {
        ...state,
        categories: copyOfCategories,
      };

    case GalleryActions.REMOVE:
      const categories = state.categories.map((category) => {
        const photos = category.gallery.filter((photo) => {
          return photo.fullpath != action.payload;
        });

        const editedPhotos = {
          ...category,
          gallery: photos,
          galleryLenght: category.gallery.length,
        };

        return editedPhotos;
      });

      return {
        ...state,
        categories: categories.filter(
          (category) => category.name != action.payload
        ),
      };

    case GalleryActions.LOADING_END:
      return {
        ...state,
        loading: false,
      };

    case GalleryActions.ERROR:
      let newErrors;
      if (state.error.length > 1 && action.payload.length > 1) {
        newErrors = state.error + '\n' + action.payload;
      } else {
        newErrors = action.payload;
      }

      return {
        ...state,
        error: newErrors,
      };

    default:
      return state;
  }
}
