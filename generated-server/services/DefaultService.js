/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* Find item by id
*
* itemId String 
* returns PagedContentItem
* */
const findItemById = ({ itemId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        itemId,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);

module.exports = {
  findItemById,
};
