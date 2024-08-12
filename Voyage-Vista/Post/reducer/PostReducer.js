import Media from "•/helper/Image";
export const initialState = {
  media: {},
  albumName: "Instagram",
  selectedImage: [],
  albumList: [],
  modalVisible: false,
  multiple: false,
};

const mediaList = (albumList) => {
  const setAlbumList = {};
  albumList.forEach((photos) => {
    setAlbumList[photos.id] = photos.uri;
  });
  return setAlbumList;
};

const setDefaultImage = (state) => {
  const getPhotos = state;
  const defaultPhoto = [getPhotos[Object.keys(getPhotos)[0]]];
  return defaultPhoto;
};

const getAllAlbumNames = (albums) => {
  const listofAlbums = albums.map((album) => album.title);
  return listofAlbums;
};

const setSelectedImageFromALbumName = async (album) => {
  const getAlbumName = await Media.getPhotosFromALbum(album);
  const photoFromAlbum = await Media.photo(getAlbumName);
  return photoFromAlbum.assets;
};

const addImage = (payload, state) => {
  let updatedPhotoArray = [];
  if (!payload.multiple) {
    updatedPhotoArray = [payload.photoUri];
  } else {
    updatedPhotoArray = [...state.selectedImagesFromAlbum, payload.photoUri];
  }
  return updatedPhotoArray;
};

const removeImage = (photoUri, state) => {
  const getAllPhotos = state.selectedImagesFromAlbum;
  const updatedPhotos = getALLPhotos.filter((uri) => uri !== photoUri);
  return updatedPhotos;
};
const IsMultiple = (state) => {
  if (state.multiple) {
    console.log("A");
    return [];
  }
  console.log("B");
  return state.selectedImagesFromAlbum;
};

export const PostReducer = (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALBUM_LIST":
      return { ...state, albumList: getAllAlbumNames(action.payload) };
    case "SET_MEDIA":
      return { ...state, media: mediaList(action.payload) };
    case "DEFAULT_IMAGE":
      return {
        ...state,
        selectedImage: setDefaultImage(state.media),
      };
    case "SET_ALBUM_NAME":
      return {
        ...state,
        albumName: action.payload,
        media: setSelectedImageFromALbumName(action.payload),
        selectedImage: setDefaultImage(state.media),
      };
    case "MODAL":
      return { ...state, modalVisible: !state.modalVisible };
    case "EMPTY":
      return initialState;
    case "SET_MULTIPLE_IMAGE":
      return {
        ...state,
        multiple: !state.multiple,
        selectedImagesFromAlbum: IsMultiple(state),
      };
    case "ADD_IMAGE":
      return {
        ...state,
        multiple: action.payload.multiple,
        selectedImagesFromAlbum: addImage(action.payload, state),
      };
    case "REMOVE_IMAGE":
      return {
        ...state,
        selectedImagesFromAlbum: removeImage(action.payload, state),
      };
    default:
      return state;
  }
};
