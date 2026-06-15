import React, { useState } from 'react';
import classNames from 'classnames';
import ReactImageGallery from 'react-image-gallery';
import { useDispatch } from 'react-redux';

import { propTypes } from '../../../util/types';
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { manageDisableScrolling } from '../../../ducks/ui.duck';
import {
  facebookIcon,
  instagramIcon,
  linkedinIcon,
  pinterestIcon,
  tiktokIcon,
  xIcon,
} from '../../PageBuilder/Primitives/Link/Icons';
import {
  AspectRatioWrapper,
  Button,
  IconClose,
  IconArrowHead,
  Modal,
  PrimaryButtonInline,
  ResponsiveImage,
  FavoriteButton,
} from '../../../components';

// Copied directly from
// `node_modules/react-image-gallery/styles/image-gallery.css`. The
// copied file is left unedited, and all the overrides are defined in
// the component CSS file below.
import './image-gallery.css';

import css from './ListingImageGallery.module.css';

const IMAGE_GALLERY_OPTIONS = {
  showPlayButton: false,
  disableThumbnailScroll: true,
};
const SHARE_MODAL_ID = 'ListingImageGallery.shareModal';

const ShareModal = ({ isOpen, onClose, url, title, onManageDisableScrolling }) => {
  const [copied, setCopied] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyForPlatform = name => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedPlatform(name);
      setTimeout(() => setCopiedPlatform(null), 2000);
    });
  };

  const platforms = [
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      Icon: facebookIcon,
      color: '#1877F2',
    },
    {
      name: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      Icon: xIcon,
      color: '#000000',
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      Icon: linkedinIcon,
      color: '#0A66C2',
    },
    {
      name: 'Pinterest',
      href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
      Icon: pinterestIcon,
      color: '#E60023',
    },
  ];

  return (
    <Modal
      id={SHARE_MODAL_ID}
      isOpen={isOpen}
      onClose={onClose}
      onManageDisableScrolling={onManageDisableScrolling}
      usePortal
    >
      <div className={css.shareModalContent}>
        <h3 className={css.shareModalTitle}>Share profile</h3>
        <div className={css.sharePlatforms}>
          {platforms.map(p => {
            const iconNode = p.Icon ? <p.Icon /> : p.icon;
            if (p.copyOnly) {
              return (
                <button
                  key={p.name}
                  className={css.sharePlatformButton}
                  style={{ '--platform-color': p.color }}
                  onClick={() => handleCopyForPlatform(p.name)}
                  title={`Copy link to share on ${p.name}`}
                >
                  <span className={css.sharePlatformIcon}>{iconNode}</span>
                  <span className={css.sharePlatformName}>
                    {copiedPlatform === p.name ? 'Copied!' : p.name}
                  </span>
                </button>
              );
            }
            return (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className={css.sharePlatformButton}
                style={{ '--platform-color': p.color }}
              >
                <span className={css.sharePlatformIcon}>{iconNode}</span>
                <span className={css.sharePlatformName}>{p.name}</span>
              </a>
            );
          })}
        </div>
        <div className={css.shareCopyRow}>
          <input
            type="text"
            readOnly
            value={url}
            className={css.shareCopyInput}
            onClick={e => e.target.select()}
          />
          <PrimaryButtonInline className={css.shareCopyButton} onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy'}
          </PrimaryButtonInline>
        </div>
      </div>
    </Modal>
  );
};

const MAX_LANDSCAPE_ASPECT_RATIO = 2; // 2:1
const MAX_PORTRAIT_ASPECT_RATIO = 4 / 3;

const getFirstImageAspectRatio = (firstImage, scaledVariant) => {
  if (!firstImage) {
    return { aspectWidth: 1, aspectHeight: 1 };
  }

  const v = firstImage?.attributes?.variants?.[scaledVariant];
  const w = v?.width;
  const h = v?.height;
  const hasDimensions = !!w && !!h;
  const aspectRatio = w / h;

  // We keep the fractions separated as these are given to AspectRatioWrapper
  // which expects separate width and height
  return hasDimensions && aspectRatio >= MAX_LANDSCAPE_ASPECT_RATIO
    ? { aspectWidth: 2, aspectHeight: 1 }
    : hasDimensions && aspectRatio <= MAX_PORTRAIT_ASPECT_RATIO
    ? { aspectWidth: 4, aspectHeight: 3 }
    : hasDimensions
    ? { aspectWidth: w, aspectHeight: h }
    : { aspectWidth: 1, aspectHeight: 1 };
};

/**
 * The ListingImageGallery component.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {Array<propTypes.image>} props.images - The images
 * @param {Array<string>} props.imageVariants - The image variants
 * @param {Array<string>} props.thumbnailVariants - The thumbnail variants
 * @returns {JSX.Element} listing image gallery component
 */
const ListingImageGallery = props => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const dispatch = useDispatch();
  const intl = useIntl();
  const { rootClassName, className, images, imageVariants, thumbnailVariants, listing } = props;

  const onManageDisableScrolling = (componentId, disableScrolling) => {
    dispatch(manageDisableScrolling(componentId, disableScrolling));
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = listing?.attributes?.title || '';
  const thumbVariants = thumbnailVariants || imageVariants;
  // imageVariants are scaled variants.
  const { aspectWidth, aspectHeight } = getFirstImageAspectRatio(images?.[0], imageVariants[0]);
  const items = images.map((img, i) => {
    return {
      // We will only use the image resource, but react-image-gallery
      // requires the `original` key from each item.
      original: '',
      alt: intl.formatMessage(
        { id: 'ListingImageGallery.imageAltText' },
        { index: i + 1, count: images.length }
      ),
      thumbAlt: intl.formatMessage(
        { id: 'ListingImageGallery.imageThumbnailAltText' },
        { index: i + 1, count: images.length }
      ),
      thumbnail: img.attributes?.variants?.[thumbVariants[0]],
      image: img,
    };
  });
  const imageSizesMaybe = isFullscreen
    ? {}
    : { sizes: `(max-width: 1024px) 100vw, (max-width: 1200px) calc(100vw - 192px), 708px` };
  const renderItem = item => {
    return (
      <AspectRatioWrapper
        width={aspectWidth || 1}
        height={aspectHeight || 1}
        className={isFullscreen ? css.itemWrapperFullscreen : css.itemWrapper}
      >
        <div className={css.itemCentering}>
          <ResponsiveImage
            rootClassName={css.item}
            image={item.image}
            alt={item.alt}
            variants={imageVariants}
            {...imageSizesMaybe}
          />
        </div>
      </AspectRatioWrapper>
    );
  };
  const renderThumbInner = item => {
    return (
      <div>
        <ResponsiveImage
          rootClassName={css.thumb}
          image={item.image}
          alt={item.thumbAlt}
          variants={thumbVariants}
          sizes="88px"
        />
      </div>
    );
  };

  const onScreenChange = isFull => {
    setIsFullscreen(isFull);
  };

  const renderLeftNav = (onClick, disabled) => {
    return (
      <button className={css.navLeft} disabled={disabled} onClick={onClick}>
        <div className={css.navArrowWrapper}>
          <IconArrowHead direction="left" size="big" />
        </div>
      </button>
    );
  };
  const renderRightNav = (onClick, disabled) => {
    return (
      <button className={css.navRight} disabled={disabled} onClick={onClick}>
        <div className={css.navArrowWrapper}>
          <IconArrowHead direction="right" size="big" />
        </div>
      </button>
    );
  };
  const renderFullscreenButton = (onClick, isFullscreen) => {
    return isFullscreen ? (
      <Button
        onClick={onClick}
        rootClassName={css.close}
        title={intl.formatMessage({ id: 'ListingImageGallery.closeModalTitle' })}
      >
        <span className={css.closeText}>
          <FormattedMessage id="ListingImageGallery.closeModal" />
        </span>
        <IconClose rootClassName={css.closeIcon} />
      </Button>
    ) : (
      <>
        <button
          className={css.shareButton}
          onClick={() => setShareModalOpen(true)}
          title="Share listing"
        >
          <svg viewBox="0 0 24 24" className={css.shareButtonIcon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
        <FavoriteButton listingId={listing.id} listingAuthor={listing.author} isVisible={true} />
        <button className={css.openFullscreen} onClick={onClick}>
          <FormattedMessage
            id="ListingImageGallery.viewImagesButton"
            values={{ count: images.length }}
          />
        </button>
      </>
    );
  };

  if (items.length === 0) {
    return <ResponsiveImage className={css.noImage} image={null} variants={[]} alt="" />;
  }

  const classes = classNames(rootClassName || css.root, className);

  return (
    <>
      <ReactImageGallery
        additionalClass={classes}
        items={items}
        renderItem={renderItem}
        renderThumbInner={renderThumbInner}
        onScreenChange={onScreenChange}
        renderLeftNav={renderLeftNav}
        renderRightNav={renderRightNav}
        renderFullscreenButton={renderFullscreenButton}
        {...IMAGE_GALLERY_OPTIONS}
      />
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
        url={shareUrl}
        title={shareTitle}
        onManageDisableScrolling={onManageDisableScrolling}
      />
    </>
  );
};

export default ListingImageGallery;
