import React from 'react';

import { FormattedMessage } from '../../../util/reactIntl';
import { isProviderCommissionBiggerThanMinPrice, isDistanceError } from '../../../util/errors';

import css from './FetchLineItemsError.module.css';

/**
 * An error text displayed when provider minimum commission value is higher than that of the listing's price
 *
 * @component
 * @param {Object} props
 * @param {Object} [props.error] - Ther error object
 * @returns {JSX.Element}
 */
const FetchLineItemsError = props => {
  const { error } = props;
  const hasError = !!error;

  return hasError && isProviderCommissionBiggerThanMinPrice(error) ? (
    <span className={css.error}>
      <FormattedMessage id="FetchLineItemsError.providerCommissionBiggerThanMinPrice" />
    </span>
  ) : hasError && isDistanceError(error) ? (
    <span className={css.error}>
      <FormattedMessage id="FetchLineItemsError.distanceError" />
    </span>
  ) : hasError ? (
    <span className={css.error}>
      <FormattedMessage id="FetchLineItemsError.unknownError" />
    </span>
  ) : null;
};

export default FetchLineItemsError;
