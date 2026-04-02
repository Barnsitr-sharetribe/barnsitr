import { displayPrice, isPriceVariationsEnabled } from '../../util/configHelpers';
import { formatMoney } from '../../util/currency';
import { richText } from '../../util/richText';
import { isBookingProcessAlias } from '../../transactions/transaction';

import css from './ListingCard.module.css';

const MIN_LENGTH_FOR_LONG_WORDS = 10;
const MAX_BIO_LENGTH = 140;

const stripHtmlToPlain = text => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

const truncateText = (text, maxLen) => {
  if (!text || text.length <= maxLen) {
    return text;
  }
  return `${text.slice(0, maxLen - 1).trim()}…`;
};

/**
 * Optional display fields for the listing card (location, tags, rating, bio excerpt).
 * Rating/review counts may come from listing or author publicData when provided via Console or Integration API.
 *
 * @param {Object} listing - listing or ownListing
 * @param {boolean} showAuthorInfo - when true, headline prefers author display name
 * @returns {Object} display data for the card body
 */
export const getListingCardDisplayData = (listing, showAuthorInfo) => {
  const { description = '', publicData } = listing?.attributes || {};
  const author = listing?.author;
  const authorProfile = author?.attributes?.profile;
  const authorPublicData = authorProfile?.publicData || {};
  const listingPd = publicData || {};

  const displayName = authorProfile?.displayName;
  const headlineIsAuthor = showAuthorInfo && displayName;

  const plainDescription = stripHtmlToPlain(description);
  const bioExcerpt = truncateText(plainDescription, MAX_BIO_LENGTH);

  const address = listingPd?.location?.address;
  const locationLabel = typeof address === 'string' && address.length > 0 ? address : '';

  const rawTags =
    (Array.isArray(listingPd.skills) && listingPd.skills) ||
    (Array.isArray(listingPd.tags) && listingPd.tags) ||
    [];
  const tags = rawTags
    .filter(t => typeof t === 'string' && t.length > 0)
    .slice(0, 5);

  const ratingRaw =
    listingPd.rating ??
    listingPd.providerRating ??
    authorPublicData.rating ??
    null;
  const rating =
    typeof ratingRaw === 'number' && !Number.isNaN(ratingRaw)
      ? Math.round(ratingRaw * 10) / 10
      : null;

  const reviewCountRaw =
    listingPd.reviewCount ??
    listingPd.providerReviewCount ??
    authorPublicData.reviewCount ??
    null;
  const reviewCount =
    typeof reviewCountRaw === 'number' && reviewCountRaw >= 0
      ? Math.floor(reviewCountRaw)
      : null;

  const showVerified =
    authorPublicData.verified === true ||
    authorPublicData.providerVerified === true ||
    authorPublicData.identityVerified === true;

  return {
    headlineIsAuthor,
    bioExcerpt,
    locationLabel,
    tags,
    rating,
    reviewCount,
    showVerified,
  };
};

const priceData = (price, currency, intl) => {
  if (price && price.currency === currency) {
    const formattedPrice = formatMoney(intl, price);
    return { formattedPrice, priceTooltip: formattedPrice };
  } else if (price) {
    return {
      formattedPrice: intl.formatMessage(
        { id: 'ListingCard.unsupportedPrice' },
        { currency: price.currency }
      ),
      priceTooltip: intl.formatMessage(
        { id: 'ListingCard.unsupportedPriceTitle' },
        { currency: price.currency }
      ),
    };
  }
  return {};
};

/**
 * Returns all translated and formatted strings for ListingCard so the
 * presentational component can stay simple and aria-labels use the same copy.
 *
 * @param {Object} listing - API entity: listing or ownListing
 * @param {Object} config - app configuration (e.g. from useConfiguration())
 * @param {Object} intl - React Intl instance (e.g. from useIntl())
 * @returns {Object} translations and derived values:
 *   - titlePlain: raw title string (for aria/alt)
 *   - titleFormatted: React nodes from richText(title) for display
 *   - showPrice: whether to show the price block
 *   - priceTooltip: string for the price element's title attribute (tooltip on hover)
 *   - priceMessage: string or null for the price block content (same translation as used in cardAriaLabel when shown)
 *   - cardAriaLabel: ready-to-use aria-label for the card link (listing title + price line when shown)
 *   - authorName: "ListingCard.author" string containing author's display name
 */
export const getListingCardTranslations = (listing, config, intl) => {
  const { title = '', price, publicData } = listing?.attributes || {};

  const authorDisplayName = listing?.author?.attributes?.profile?.displayName;
  const authorName = intl.formatMessage(
    { id: 'ListingCard.author' },
    { authorName: authorDisplayName }
  );

  const validListingTypes = config.listing.listingTypes || [];
  const { listingType } = publicData || {};
  const listingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);

  const showPrice = displayPrice(listingTypeConfig);
  const { formattedPrice, priceTooltip } = priceData(price, config.currency, intl);

  const isPriceVariationsInUse = isPriceVariationsEnabled(publicData, listingTypeConfig);
  const hasMultiplePriceVariants = isPriceVariationsInUse && publicData?.priceVariants?.length > 1;
  const isBookable = isBookingProcessAlias(publicData?.transactionProcessAlias);

  const priceMessageId = hasMultiplePriceVariants
    ? 'ListingCard.priceStartingFrom'
    : 'ListingCard.price';

  const perUnitString = isBookable
    ? intl.formatMessage({ id: 'ListingCard.perUnit' }, { unitType: publicData?.unitType })
    : '';

  // Single formatted price line (amount + per-unit if applicable); used for both card aria and price block
  const priceValue = <span className={css.priceValue}>{formattedPrice}</span>;
  const pricePerUnit = isBookable ? <span className={css.perUnit}>{perUnitString}</span> : '';
  const priceMessage =
    showPrice && formattedPrice != null
      ? intl.formatMessage({ id: priceMessageId }, { priceValue, pricePerUnit })
      : '';

  const cardAriaLabel =
    priceMessage.length > 0
      ? intl.formatMessage(
          { id: 'ListingCard.screenreader.label' },
          { listingTitle: title, formattedPrice: priceMessage }
        )
      : title;

  return {
    titlePlain: title,
    titleFormatted: richText(title, {
      longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS,
      longWordClass: css.longWord,
    }),
    authorName,
    showPrice,
    priceTooltip,
    priceMessage,
    cardAriaLabel,
  };
};
