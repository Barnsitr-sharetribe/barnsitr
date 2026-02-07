import classNames from 'classnames';

import css from './IconsCollection.module.css';

export const HEART_ICON = 'heartIcon';
export const HEART_OUTLINE = 'heartOutline';
export const HEART = 'heart';

/**
 * Icon collection for filters and UI elements.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param { 'heartIcon' | 'heartOutline' } props.type icon type
 * @param {boolean?} props.filled for heart icon, whether it should be filled
 * @returns {JSX.Element} SVG icon
 */
const IconsCollection = props => {
  const {
    className,
    rootClassName,
    type = 'location',
    filled = false,
    style = {},
    strokeColor = 'var(--marketplaceColor)',
  } = props;
  const classes = classNames(rootClassName || css.root, className);
  const roleInfo = {
    role: 'img',
    ['aria-label']: type,
  };

  switch (type) {
    case HEART:
      return (
        <svg
          className={classes}
          xmlns="http://www.w3.org/2000/svg"
          width="20px"
          height="20px"
          viewBox="0 0 64 64"
          enableBackground="new 0 0 64 64"
        >
          <path
            fill="none"
            stroke={strokeColor}
            stroke-width="4"
            stroke-miterlimit="10"
            d="M32 59C32 59 3 45 3 22C3 12 10 5 19 5C25 5 30 9 32 13C34 9 39 5 45 5C54 5 61 12 61 22C61 45 32 59 32 59Z"
          />
        </svg>
      );

    case HEART_OUTLINE:
      return (
        <svg
          className={classes}
          viewBox="0 0 1024 1024"
          style={style}
          aria-hidden="true"
          {...roleInfo}
        >
          <path d="M923 283.6a260.04 260.04 0 00-56.9-82.8 264.4 264.4 0 00-84-55.5A265.34 265.34 0 00679.7 125c-49.3 0-97.4 13.5-139.2 39-10 6.1-19.5 12.8-28.5 20.1-9-7.3-18.5-14-28.5-20.1-41.8-25.5-89.9-39-139.2-39-35.5 0-69.9 6.8-102.4 20.3-31.4 13-59.7 31.7-84 55.5a258.44 258.44 0 00-56.9 82.8c-13.9 32.3-21 66.6-21 101.9 0 33.3 6.8 68 20.3 103.3 11.3 29.5 27.5 60.1 48.2 91 32.8 48.9 77.9 99.9 133.9 151.6 92.8 85.7 184.7 144.9 188.6 147.3l23.7 15.2c10.5 6.7 24 6.7 34.5 0l23.7-15.2c3.9-2.5 95.7-61.6 188.6-147.3 56-51.7 101.1-102.7 133.9-151.6 20.7-30.9 37-61.5 48.2-91 13.5-35.3 20.3-70 20.3-103.3.1-35.3-7-69.6-20.9-101.9zM512 814.8S156 586.7 156 385.5C156 283.6 240.3 201 344.3 201c73.1 0 136.5 40.8 167.7 100.4C543.2 241.8 606.6 201 679.7 201c104 0 188.3 82.6 188.3 184.5 0 201.2-356 429.3-356 429.3z" />
        </svg>
      );
    case HEART_ICON:
      return (
        <svg
          className={classes}
          viewBox="0 0 1024 1024"
          style={style}
          aria-hidden="true"
          {...roleInfo}
        >
          <path d="M923 283.6a260.04 260.04 0 00-56.9-82.8 264.4 264.4 0 00-84-55.5A265.34 265.34 0 00679.7 125c-49.3 0-97.4 13.5-139.2 39-10 6.1-19.5 12.8-28.5 20.1-9-7.3-18.5-14-28.5-20.1-41.8-25.5-89.9-39-139.2-39-35.5 0-69.9 6.8-102.4 20.3-31.4 13-59.7 31.7-84 55.5a258.44 258.44 0 00-56.9 82.8c-13.9 32.3-21 66.6-21 101.9 0 33.3 6.8 68 20.3 103.3 11.3 29.5 27.5 60.1 48.2 91 32.8 48.9 77.9 99.9 133.9 151.6 92.8 85.7 184.7 144.9 188.6 147.3l23.7 15.2c10.5 6.7 24 6.7 34.5 0l23.7-15.2c3.9-2.5 95.7-61.6 188.6-147.3 56-51.7 101.1-102.7 133.9-151.6 20.7-30.9 37-61.5 48.2-91 13.5-35.3 20.3-70 20.3-103.3.1-35.3-7-69.6-20.9-101.9z" />
        </svg>
      );

    default:
      return null;
  }
};

export default IconsCollection;
