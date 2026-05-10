const { handleError } = require('../../api-util/sdk');
const { videoConferenceServices, sharetribeServices } = require('../../services');
const { denormalisedResponseEntities } = require('../../api-util/data');

const createRoom = async (req, res) => {
  try {
    const { listingTitle, txID } = req.body;

    const txRes = await sharetribeServices.getTransaction(txID, {
      include: ['customer', 'provider'],
    });
    const tx = denormalisedResponseEntities(txRes)[0];

    if (!tx?.id?.uuid) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const { customer, provider } = tx;
    const txRole =
      customer.id.uuid === req.tokenUserId
        ? 'customer'
        : provider.id.uuid === req.tokenUserId
        ? 'provider'
        : null;

    if (!txRole) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await videoConferenceServices.setupRoom(txID, listingTitle);
    res.status(200).json(result);
  } catch (error) {
    console.log(error, 'Error creating room!!');
    handleError(res, error);
  }
};

module.exports = createRoom;
