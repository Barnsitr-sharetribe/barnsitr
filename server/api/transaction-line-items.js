const { transactionLineItems } = require('../api-util/lineItems');
const { getSdk, handleError, serialize, fetchCommission } = require('../api-util/sdk');
const { constructValidLineItems } = require('../api-util/lineItemHelpers');
const { calculateDistance } = require('./helper');

module.exports = (req, res) => {
  const { isOwnListing, listingId, orderData } = req.body || {};

  const sdk = getSdk(req, res);

  const listingPromise = () =>
    isOwnListing ? sdk.ownListings.show({ id: listingId }) : sdk.listings.show({ id: listingId });

  Promise.all([listingPromise(), fetchCommission(sdk)])
    .then(async ([showListingResponse, fetchAssetsResponse]) => {
      const listing = showListingResponse.data.data;
      const {
        publicData: { serviceArea },
      } = listing.attributes;
      const commissionAsset = fetchAssetsResponse.data.data[0];

      const { providerCommission, customerCommission } =
        commissionAsset?.type === 'jsonAsset' ? commissionAsset.attributes.data : {};

      let isWithinServiceArea = true;
      if (orderData?.location?.origin) {
        const distance = await calculateDistance(
          orderData.location.origin,
          listing.attributes.geolocation
        );

        if (distance > serviceArea || distance === null) {
          isWithinServiceArea = false;
        }
      }

      const lineItems = transactionLineItems(
        listing,
        orderData,
        providerCommission,
        customerCommission
      );

      // Because we are using returned lineItems directly in this template we need to use the helper function
      // to add some attributes like lineTotal and reversal that Marketplace API also adds to the response.
      const validLineItems = constructValidLineItems(lineItems);

      res
        .status(200)
        .set('Content-Type', 'application/transit+json')
        .send(serialize({ data: validLineItems, isWithinServiceArea }))
        .end();
    })
    .catch(e => {
      handleError(res, e);
    });
};
