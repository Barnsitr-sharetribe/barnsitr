import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../../util/reactIntl';
import { Heading, PrimaryButtonInline } from '../../../components';

import css from './TransactionPanel.module.css';
import { transitions } from '../../../transactions/transactionProcessBooking';
import { setupVideoConferenceRoom } from '../../../util/api';
import { fetchTransactionThunk } from '../TransactionPage.duck';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// Functional component as a helper to build ActivityFeed section
const FeedSection = props => {
  const [loading, setLoading] = React.useState(false);
  const history = useHistory();
  const dispatch = useDispatch();
  const {
    className,
    rootClassName,
    activityFeed,
    hasTransitions,
    fetchMessagesError,
    hasMessages,
    isConversation,
    title,
    txID,
    onSendMessage,
    config,
    metadata,
    isCustomer,
    ownDisplayName,
    transitions: t,
  } = props;

  const showFeed = hasMessages || hasTransitions || fetchMessagesError;

  const classes = classNames(rootClassName || css.feedContainer, className);
  const isInquiry = t?.some(t => t.transition === transitions.INQUIRE);
  const isVideoRoomCreated = !!metadata?.customerCode && !!metadata?.providerCode && isInquiry;

  const handleVideoCall = async () => {
    if (isVideoRoomCreated) {
      history.push(
        `/video-meeting?roomCode=${isCustomer ? metadata.customerCode : metadata.providerCode}`
      );
    } else {
      try {
        setLoading(true);
        const res = await setupVideoConferenceRoom({
          listingTitle: title,
          txID: txID.uuid,
        });

        if (res.roomId) {
          await onSendMessage(
            txID,
            `${ownDisplayName} is inviting you to a video call. Make sure you have discussed the time and date in advance`,
            config
          );
          await dispatch(
            fetchTransactionThunk({
              id: txID,
              txRole: isCustomer ? 'customer' : 'provider',
              config,
            })
          );
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }
  };

  return showFeed ? (
    <div className={classes}>
      <div className={css.feedSectionHeader}>
        <Heading as="h3" rootClassName={css.sectionHeading}>
          {isConversation ? (
            <FormattedMessage id="TransactionPanel.conversationHeading" />
          ) : (
            <FormattedMessage id="TransactionPanel.activityHeading" />
          )}
        </Heading>
        {!isInquiry ? null : isVideoRoomCreated ? (
          <PrimaryButtonInline
            type="button"
            className={css.videoCallButton}
            onClick={handleVideoCall}
          >
            Join video call
          </PrimaryButtonInline>
        ) : (
          <PrimaryButtonInline
            type="button"
            className={css.videoCallButton}
            onClick={handleVideoCall}
            inProgress={loading}
            disabled={loading}
          >
            Create video call
          </PrimaryButtonInline>
        )}
      </div>
      {fetchMessagesError ? (
        <p className={css.messageError}>
          <FormattedMessage id="TransactionPanel.messageLoadingFailed" />
        </p>
      ) : null}
      <div className={css.feedContent}>{activityFeed}</div>
    </div>
  ) : null;
};

export default FeedSection;
