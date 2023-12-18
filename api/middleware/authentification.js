module.exports = (request, response, next) => {
  /**
   * File containing the configurations necessary for the proper functioning of the system.
   */
  const config = require('../config');

  try {
      /**
       * Here we recover the API password, by GET or POST request.
       */
      const pass = request.body.password || request.params.apipassword;

      /**
       * We check if the API password is not empty, if yes, security error and we return an error.
       */
      if (config.apipassword == '') error('Your API Password is not set, look at your config file.', 401);

      /**
       * Depending on the use case, we return an error code or then we next() => means that everything is good and that the function passes.
       */
      switch (pass) {
          case ' ':
              error('The password you sent is empty.', 401);
              break;
          case undefined:
              error('Please send the password API.', 401);
              break;
          case config.apipassword:
              next();
              break;
          default:
              error('Invalid password.', 401);
              break;
      }

  } catch {
      response.status(401).json({
          error: 'Invalid request!'
      });
  }

  function error(msg, statuscode) {
      response.status(statuscode).json({
          error: msg
      });
  }
};