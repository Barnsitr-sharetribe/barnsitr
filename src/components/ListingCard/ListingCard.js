// ⚠️ If you modify the styling of this component and you're using the SectionListings component in your marketplace (featured listings)
// please reflect those changes in the calculateCarouselHeight function in SectionListings.js to avoid layout issues
import React from 'react';
import classNames from 'classnames';

import { useConfiguration } from '../../context/configurationContext';

import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { requireListingImage } from '../../util/configHelpers';
import { lazyLoadWithDimensions } from '../../util/uiHelpers';
import { createSlug } from '../../util/urlHelpers';

import {
  AspectRatioWrapper,
  NamedLink,
  ResponsiveImage,
  ListingCardThumbnail,
  FavoriteButton,
  IconReviewStar,
  IconLocation,
  IconCheckmark,
} from '../../components';

import { getListingCardTranslations, getListingCardDisplayData } from './ListingCard.helpers';

import css from './ListingCard.module.css';

const LazyImage = lazyLoadWithDimensions(ResponsiveImage, { loadAfterInitialRendering: 3000 });

/**
 * ListingCardImage
 * Component responsible for rendering the image part of the listing card.
 * It either renders the first image from the listing's images array with lazy loading,
 * or a stylized placeholder if images are disabled for the listing type.
 * Also wraps the image in a fixed aspect ratio container for consistent layout.
 * @component
 * @param {Object} props
 * @param {Object} props.listing listing entity with image data
 * @param {Function?} props.setActivePropsMaybe mouse enter/leave handlers for map highlighting
 * @param {string} props.title listing title for alt text
 * @param {string} props.renderSizes img/srcset size rules
 * @param {number} props.aspectWidth aspect ratio width
 * @param {number} props.aspectHeight aspect ratio height
 * @param {string} props.variantPrefix image variant prefix (e.g. "listing-card")
 * @param {boolean} props.showListingImage whether to show actual listing image or not
 * @param {Object?} props.style the background color for the listing card with no image
 * @returns {JSX.Element} listing image with fixed aspect ratio or fallback preview
 */
const ListingCardImage = props => {
  const {
    listing,
    setActivePropsMaybe,
    title,
    renderSizes,
    aspectWidth,
    aspectHeight,
    variantPrefix,
    aspectRatioClassName,
    lazyLoadImage,
  } = props;

  const firstImage = listing.author?.profileImage;
  const variants = firstImage
    ? Object.keys(firstImage?.attributes?.variants).filter(k => k.startsWith(variantPrefix))
    : [];

  const aspectRatioClass = aspectRatioClassName || css.aspectRatioWrapper;
  const ImageComponent = lazyLoadImage ? LazyImage : ResponsiveImage;

  return (
    <AspectRatioWrapper
      className={aspectRatioClass}
      width={aspectWidth}
      height={aspectHeight}
      // {...setActivePropsMaybe}
    >
      <ImageComponent
        rootClassName={css.rootForImage}
        alt={title}
        image={firstImage}
        variants={variants}
        sizes={renderSizes}
      />
    </AspectRatioWrapper>
  );
};

/**
 * ListingCard
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to component's own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {string?} props.aspectRatioClassName custom className for AspectRatioWrapper component
 * @param {Object} props.listing API entity: listing or ownListing
 * @param {string?} props.renderSizes for img/srcset
 * @param {Function?} props.setActiveListing
 * @param {boolean?} props.showAuthorInfo
 * @returns {JSX.Element} listing card to be used in search result panel etc.
 */
export const ListingCard = props => {
  const config = useConfiguration();
  const intl = props.intl || useIntl();

  const {
    className,
    rootClassName,
    aspectRatioClassName,
    darkMode,
    listing,
    renderSizes,
    setActiveListing,
    showAuthorInfo = true,
    lazyLoadImage = true,
  } = props;

  const translations = getListingCardTranslations(listing, config, intl);
  const {
    titlePlain,
    titleFormatted,
    cardAriaLabel,
    showPrice,
    priceTooltip,
    priceMessage,
  } = translations;

  const displayData = getListingCardDisplayData(listing, showAuthorInfo);
  const {
    headlineIsAuthor,
    bioExcerpt,
    locationLabel,
    tags,
    rating,
    reviewCount,
    showVerified,
  } = displayData;

  const classes = classNames(rootClassName || css.root, className, {
    [css.rootDark]: darkMode,
  });

  const id = listing?.id?.uuid;
  const { title = '', publicData } = listing?.attributes || {};
  const slug = createSlug(title);

  const { listingType, cardStyle } = publicData || {};
  const validListingTypes = config.listing.listingTypes || [];
  const foundListingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);
  const showListingImage = requireListingImage(foundListingTypeConfig);

  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config.layout.listingImage;

  const setActivePropsMaybe = setActiveListing
    ? {
        onMouseEnter: () => setActiveListing(listing?.id),
        onMouseLeave: () => setActiveListing(null),
      }
    : null;

  const showRatingBlock = rating != null;
  const showReviewCount = showRatingBlock && reviewCount != null && reviewCount > 0;

  return (
   <div>
     <NamedLink
      className={classes}
      name="ListingPage"
      params={{ id, slug }}
      ariaLabel={cardAriaLabel}
    >
      <div className={css.imageArea} {...setActivePropsMaybe}>
        {showListingImage ? (
          <ListingCardImage
            renderSizes={renderSizes}
            title={titlePlain}
            listing={listing}
            setActivePropsMaybe={null}
            aspectWidth={aspectWidth}
            aspectHeight={aspectHeight}
            variantPrefix={variantPrefix}
            aspectRatioClassName={aspectRatioClassName}
            lazyLoadImage={lazyLoadImage}
          />
        ) : (
          <ListingCardThumbnail
            style={cardStyle}
            listingTitle={title}
            className={classNames(css.aspectRatioWrapper, aspectRatioClassName)}
            width={aspectWidth}
            height={aspectHeight}
            setActivePropsMaybe={null}
          />
        )}
        <FavoriteButton
          listingId={listing.id}
          listingAuthor={listing.author}
          isVisible={true}
          rootClassName={css.favoriteOnImage}
        />
        {showVerified ? (
          <div className={css.verifiedBadge}>
            <span className={css.verifiedIcon} aria-hidden="true">
              <IconCheckmark rootClassName={css.verifiedCheck} size="small" />
            </span>
            <span className={css.verifiedLabel}>
              <FormattedMessage id="ListingCard.verified" />
            </span>
          </div>
        ) : null}
      </div>

      <div className={css.info}>
        <div className={css.headerRow}>
          <div className={classNames(css.headline, { [css.lightText]: darkMode })}>
            <span className={css.headlineSerif}>
              {showListingImage && headlineIsAuthor
                ? listing.author?.attributes?.profile?.displayName
                : titleFormatted}
            </span>
          </div>
          {showRatingBlock ? (
            <div className={css.ratingColumn} aria-hidden="true">
              <div className={css.ratingMain}>
                <IconReviewStar className={css.ratingStar} isFilled />
                <span className={css.ratingValue}>{rating}</span>
              </div>
              {showReviewCount ? (
                <span className={css.reviewCount}>
                  <FormattedMessage id="ListingCard.reviewsCount" values={{ count: reviewCount }} />
                </span>
              ) : null}
            </div>
          ) : (
            <div className={css.ratingColumnPlaceholder} />
          )}
        </div>

        {locationLabel ? (
          <div className={css.locationRow}>
            <IconLocation rootClassName={css.locationIcon} />
            <span className={css.locationText}>{locationLabel}</span>
          </div>
        ) : null}

        {bioExcerpt ? (
          <p className={classNames(css.bio, { [css.lightTextMuted]: darkMode })}>{bioExcerpt}</p>
        ) : null}

        {tags.length > 0 ? (
          <ul className={css.tags}>
            {tags.map(tag => (
              <li key={tag} className={css.tag}>
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        {/* <div className={css.divider} /> */}

        <div className={css.footerRow}>
          {showPrice ? (
            <div className={css.footerPrice} title={priceTooltip}>
              {priceMessage}
            </div>
          ) : (
            <div className={css.footerPricePlaceholder} />
          )}
          
        </div>
      </div>
    </NamedLink>
   </div>
  );
};

export default ListingCard;
