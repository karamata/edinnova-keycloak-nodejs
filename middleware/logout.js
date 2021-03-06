/*
 * Copyright 2016 Red Hat Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
'use strict';

module.exports = function (keycloak, logoutUrl) {
  return function logout (request, response, next) {
    if (request.url !== logoutUrl) {
      return next();
    }

    if (request.kauth.grant) {
      keycloak.deauthenticated(request);
      request.kauth.grant.unstore(request, response);
      delete request.kauth.grant;
    }

    let host = request.hostname;
    let headerHost = request.headers.host.split(':');
    let port = headerHost[1] || '';
    let redirectUrl = request.protocol + '://' + host + (port === '' ? '' : ':' + port) + '/';
    redirectUrl = redirectUrl && redirectUrl.replace('http://', 'https://');
    let keycloakLogoutUrl = keycloak.logoutUrl(redirectUrl);

    response.redirect(keycloakLogoutUrl);
  };
};
