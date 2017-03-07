(function () {
  angular
    .module("app")
    .service("invitationsService", invitationsService);

  function invitationsService($http, ENV) {
    return {
      accept
    };

    function accept(data) {
      return $http.put(ENV.api + "auth/invitation", data);
    }
  }
})();
