(function () {
  angular
    .module("app")
    .controller("CanvasHeaderCtrl", CanvasHeaderCtrl);

  function CanvasHeaderCtrl($scope, $modal, $http, $stateParams, $location, ENV, CacheFactory, projectService, tagsService, toastr, toastrConfig) {

    angular.extend(toastrConfig, {
      target: '.canvas-screen-viewer'
    });

    $scope.currentArtboard = {};
    $scope.projectData = {};

    var projectCache,
        projectCacheKey = ENV.api + 'projects/' + $stateParams.id + '?project[slug]=' + $stateParams.slug;

    if (!CacheFactory.get('projectCache')) {
      CacheFactory.createCache('projectCache', {
        deleteOnExpire: 'aggressive',
        recycleFreq: 60000
      });
    }

    projectCache = CacheFactory.get('projectCache');

    $scope.artboardStatusesClasses = ['danger', 'warning', 'success'];

    var info = {
      id: $stateParams.id,
      slug: $stateParams.slug
    }

    if(info.slug !==undefined) {
      projectService.getProject(info.id, info.slug)
      .then(function(p) {
        $scope.team = p.team.users;
        if($stateParams.artboardId !==undefined) {
          $scope.currentArtboard = _.findWhere(p.artboards, {id: parseInt($stateParams.artboardId)});
        }
      }, function() {
        // console.log("Server did not send project data!");
      });
    }

    $scope.setArtBoardStatus = function(status, $event) {
      var toggler = $($event.currentTarget).closest('dropdown-toggle')
      // toggler.addClass('disabled');
      this.$close();
      var artboard = {
        "artboard_id" : $stateParams.artboardId,
        "status": status
      };
      $http.post(ENV.api + "projects/" + $stateParams.id + "/artboards/" + $stateParams.artboardId + "/set_status", artboard)
        .success(function(data) {
          toastr.success('Well Done! Artboard status updated');
          toggler.removeClass('disabled');
          $scope.currentArtboard = data;
          projectCache.remove(projectCacheKey);
        })
        .error(function(data) {
          toggler.removeClass('disabled');
          // console.log("Error: " + data);
        });
    };

    $scope.setArtBoardDueDate = function(date) {
      var toggler = $('dropdown-toggle.calendar-menu')
      // toggler.addClass('disabled');
      this.$close();
      var artboard = {
        "artboard_id" : $stateParams.artboardId,
        "due_date": date
      };
      $http.post(ENV.api + "projects/" + $stateParams.id + "/artboards/" + $stateParams.artboardId + "/set_due_date", artboard)
        .success(function(data) {
          toggler.removeClass('disabled');
          // TODO: Pickadate throw an error here because it cannot handle the data
          toastr.success('Well Done! Artboard due date updated');
          $scope.currentArtboard = data;
          projectCache.remove(projectCacheKey);
        })
        .error(function(data) {
          toggler.removeClass('disabled');
          // console.log("Error: " + data);
        });
    };

    $scope.onTagAdded = function() {
      var toggler = $("dropdown-toggle.tags-dropdown");
      projectCache.remove(projectCacheKey);
      tagsService.getTags($stateParams.artboardId, "Artboard")
      .then(function(data) {
        toggler.removeClass("disabled");
        $scope.currentArtboard.tags = data;
      }, function() {
        toggler.removeClass("disabled");
      });
    }

    $scope.deleteTag = function(id, $event) {
      $($event.currentTarget).closest('a').css('opacity', 0.5);
      tagsService.deleteTag(id)
      .then(function(data) {
        toastr.success('Well Done! Tag removed');
        projectCache.remove(projectCacheKey);
        tagsService.getTags($stateParams.artboardId, "Artboard")
        .then(function(data) {
          $scope.currentArtboard.tags = data;
        }, function() {
          // console.log('Server did not send project data!');
        });
      }, function() {
        toggler.removeClass('disabled');
        // console.log('Server did not send project data!');
      });
    }

    $scope.assignArtboard = function(userId, $event) {
      var toggler = $($event.currentTarget).closest('dropdown-toggle')
      // toggler.addClass('disabled');
      this.$close();
      var member = {
        "artboard_id" : $stateParams.artboardId,
        "user_id": userId
      };
      projectService.assignArtboard($stateParams.id, $stateParams.artboardId, member)
      .then(function(p) {
        toggler.removeClass('disabled');
        toastr.success('Well Done! Member was assignd to this artboard successfully');
        projectCache.remove(projectCacheKey);
        $scope.currentArtboard.assignee = p.assignee;
      }, function() {
        toggler.removeClass('disabled');
        // console.log("Server did not send project data!");
      });
    }

    $scope.openModal = function(template, parameters) {
      if(parameters !== undefined) {
        $scope.projectData = parameters;
      }
      var params = {
        templateUrl: template,
        controller: ["$scope", "$modalInstance", function($scope, $modalInstance) {
          $scope.reposition = function() {
            $modalInstance.reposition();
          };
          $scope.ok = function() {
            $modalInstance.close();
          };
          $scope.cancel = function() {
            $modalInstance.dismiss("cancel");
          };
        }],
        scope: $scope
      };
      var modalInstance = $modal.open(params);
      $scope.modal = modalInstance;
      modalInstance.result.then(function() {
      }, function() {
        // Callback when the modal is dismissed.
        $scope.projectData = {};
      });
    };

    $scope.createProject = function() {
      var project = {
        "project" : $scope.projectData
      };
      $http.post(ENV.api + "projects", project)
      .success(function(data) {
        $scope.modal.close();
        toastr.success('Well Done! Project added successfully');
      })
      .error(function(data) {
        // console.log('Error: ' + data);
      });
    };

    $scope.getDate = function(date) {
      var date = new Date(date);
      return date.getDate();
    }

    $scope.deleteArtboard = function(artboardId) {
      console.log(artboardId);
      $http({
        method: "DELETE",
        url: ENV.api + "projects/" + $stateParams.id + "/artboards/" + artboardId,
        headers: {"Content-Type": "application/json;charset=utf-8"}
      })
      .success(function(data) {
        projectCache.remove(projectCacheKey);
        $scope.modal.close();
        toastr.success('Artboard removed successfully');
        $location.path("/projects/" + $stateParams.id + "/" + $stateParams.slug);
      })
      .error(function(data) {
        // console.log("Error: " + data);
      });
    };

    // TODO: Change this to the real endpoint when notifications are implemented in API
    // if($stateParams.slug !== undefined) {
      projectService.getProjectActivities($stateParams.id)
      .then(function(activities) {
        $scope.notifications = activities[0].activities;
      }, function() {
        // console.log('Server did not send project data!');
      });
    // }
  }
})();
