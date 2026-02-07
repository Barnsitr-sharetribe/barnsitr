import { storableError } from '../../util/errors';
import { createImageVariantConfig } from '../../util/sdkLoader';
import { parse } from '../../util/urlHelpers';
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const responseListingIds = data => data.data.map(l => l.id);

// ================ Async thunks ================ //

export const queryFavoriteListings = createAsyncThunk(
  'FavoriteListingsPage/queryFavoriteListings',
  async ({ queryParams, config }, { dispatch, rejectWithValue, extra: sdk, getState }) => {
    try {
      const { currentUser } = getState().user;
      const { favorites } = currentUser?.attributes.profile.privateData || {};

      const favoritesMaybe = favorites ? { ids: favorites } : { ids: [] };

      const { perPage = 100, ...rest } = queryParams;
      const params = { ...favoritesMaybe, ...rest, perPage };
      const response = await sdk.listings.query(params);
      const listingFields = config?.listing?.listingFields;
      const sanitizeConfig = { listingFields };

      dispatch(addMarketplaceEntities(response, sanitizeConfig));
      return {
        ids: responseListingIds(response.data),
        meta: response.data.meta,
      };
    } catch (e) {
      return rejectWithValue(storableError(e));
    }
  },
  { serializeError: storableError }
);

// ================ Page asset loader ================ //
export const loadData = (params, search, config) => dispatch => {
  const queryParams = parse(search);
  const page = queryParams.page || 1;

  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config.layout.listingImage;
  const aspectRatio = aspectHeight / aspectWidth;

  return dispatch(
    queryFavoriteListings({
      queryParams: {
        ...queryParams,
        page,
        include: ['author', 'images', 'author.profileImage'],
        'fields.image': [`variants.${variantPrefix}`, `variants.${variantPrefix}-2x`],
        ...createImageVariantConfig(`${variantPrefix}`, 400, aspectRatio),
        ...createImageVariantConfig(`${variantPrefix}-2x`, 800, aspectRatio),
        'limit.images': 1,
      },
      config,
    })
  );
};

// ================ Slice ================ //

const initialState = {
  pagination: null,
  queryParams: null,
  queryInProgress: false,
  queryFavoritesError: null,
  currentPageResultIds: [],
};

const favoritesPageSlice = createSlice({
  name: 'favoritesPage',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Favorites listings
      .addCase(queryFavoriteListings.pending, (state, action) => {
        state.queryParams = action.meta.arg.queryParams;
        state.queryInProgress = true;
        state.queryFavoritesError = null;
        state.currentPageResultIds = [];
      })
      .addCase(queryFavoriteListings.fulfilled, (state, action) => {
        state.queryInProgress = false;
        state.currentPageResultIds = action.payload.ids;
        state.pagination = action.payload.meta;
      })
      .addCase(queryFavoriteListings.rejected, (state, action) => {
        state.queryInProgress = false;
        state.queryFavoritesError = action.payload;
      });
  },
});

export default favoritesPageSlice.reducer;
