(function () {
  angular
    .module("app")
    .controller("ActivityCtrl", ActivityCtrl);

  function ActivityCtrl($scope, $stateParams, projectService, toastr, toastrConfig) {

    var vm = this;
    $scope.menu = "projects-activities";
    $scope.page = "activity";
    $scope.message = "";

    var init = function() {
      projectService.getProjectActivities($stateParams.id)
      .then(function(activities) {
        vm.activity = activities;
      }, function() {
        // console.log('Server did not send project data!');
      });
    }

    init();

    $scope.postActivity = function () {
      var params = {
        "project_id": $stateParams.id,
        "message": $scope.message,
        "user_id": $scope.$parent.user.id
      }
      projectService.postProjectActivity($stateParams.id, params)
      .then(function(activities) {
        init();
        toastr.success("Message submitted successfully");
        $scope.message = "";
      }, function() {
        // console.log('Server did not send project data!');
      });
    }
  }
})();
