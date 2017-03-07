(function () {
  angular
    .module("app")
    .controller("AcceptInvitaitionCtrl", AcceptInvitaitionCtrl);

  function AcceptInvitaitionCtrl($auth, $state, $scope, toastr, invitationsService) {
    const vm = this;

    vm.form = {
      invitation_token: $state.params.invitation_token
    };
    vm.submit  = submit;

    $scope.passwordField = "password";

    function submit() {
      start();
      invitationsService.accept(vm.form)
        .then(success)
        .catch(fail)
        .finally(end);
    }

    function start() {
      vm.loading = true;
    }

    function end() {
      vm.loading = false;
    }

    function success() {
      toastr.success('Your password has been successfully set, please login!');
      $state.go("login");
    }

    function fail(err) {
      const errors = err.errors || err.data.errors;
      vm.errors = errors;
    }
  }
})();
