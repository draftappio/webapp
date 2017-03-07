(function () {
  angular
    .module("app")
    .controller("SettingsCtrl", SettingsCtrl);

  function SettingsCtrl($scope, $auth, $stateParams, $modal, toastrConfig, toastr, projectService, settingsService) {

    angular.extend(toastrConfig, {
      target: '.canvas-screen-viewer'
    });

    var vm = this;

    $scope.menu = "settings";
    $scope.tab = $stateParams.param;
    $scope.user = $scope.$parent.user;
    $scope.updateAccountForm = {
      name: $scope.$parent.user.name,
      email: $scope.$parent.user.email
    }

    settingsService.getNotificationsSettings($scope.$parent.user.id)
    .then(function(settings) {
      $scope.settings = settings;
    }, function() {
      // console.log('Server did not send project data!');
    });

    $scope.updateAccount = function() {
      $auth.updateAccount($scope.updateAccountForm)
        .then(function(resp) {
          console.log(resp);
          // handle success response
        })
        .catch(function(resp) {
          // handle error response
        });
    };

    vm.updateNotificationsSettings = function() {
      var params = {
        "user_id": $scope.$parent.user.id,
        "notification_setting": {
          "summary": $scope.settings.summary,
          "mention_me": $scope.settings.mention_me,
          "create_project": $scope.settings.create_project,
          "weekly_summary": $scope.settings.weekly_summary,
          "project_comment": $scope.settings.project_comment,
          "new_features": $scope.settings.new_features
        }
      }
      settingsService.updateNotificationsSettings($scope.$parent.user.id, params)
      .then(function(settings) {
        $scope.settings = settings;
      }, function() {
        // console.log('Server did not send project data!');
      });
    }

    $scope.members = [
      {
        firstname: '',
        lastname: '',
        email: '',
        role: 0,
        roleName: 'Member'
      }
    ];

    $scope.addNewMember = function() {
      $scope.members.push(
        {
          firstname: '',
          lastname: '',
          email: '',
          role: 0,
          roleName: 'Member'
        }
      );
    };

    $scope.removeUnsavedMember = function(index) {
      if($scope.members.length === 1) return;
      $scope.members.splice(index, 1);
    };

    $scope.selectMemberRole = function(member, role) {
      member.role = role;
      member.roleName = role? 'Admin' : 'Member';
    };
    var init = function() {
      projectService.getProjects()
      .then(function(projects) {
        $scope.projects = projects;
      }, function() {
        // console.log('Server did not send project data!');
      });
    }

    $scope.inviteMembers = function() {
      if(!$scope.selectedProject) {
        toastr.error('Please select project');
        return;
      }
      start();

      var project = {
        "project" : {
          "slug": $scope.selectedProject.slug,
          "users" : $scope.members
        }
      };
      projectService.addTeamMember($scope.selectedProject.id, project)
      .then(function(data) {
        end();
        $scope.members = [
          {
            firstname: '',
            lastname: '',
            email: '',
            role: 0,
            roleName: 'Member'
          }
        ];
        toastr.success('Members invited successfully');
        $scope.selectedProject.team = data.team;
      }, function() {
        end();
        // console.log('Server did not send project data!');
      });
    }

    $scope.setSelectedProject = function(project) {
      $scope.selectedProject = project;
    }

    $scope.openModal = function(template, parameters) {
      $scope.projectData = parameters;
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

    $scope.removeMember = function(email) {
      if($scope.$parent.user.email === email) {
        $scope.modal.close();
        toastr.error('You cannot remove yourself from the project');
        return;
      }
      var project = {
        "project" : {
          "slug": $scope.selectedProject.slug,
          "email" : email
        }
      };
      projectService.removeTeamMember($scope.selectedProject.id, project)
      .then(function(data) {
        toastr.success('Member removed from your team successfully');
        $scope.modal.close();
        $scope.selectedProject.team = data.team;
      }, function(data) {
        $scope.modal.close();
        // console.log('Server did not send project data!');
      });
    }

    $scope.checkIfAdmin = function() {
      if(!$scope.selectedProject) return;
      var isAdmin = _.any($scope.selectedProject.team.users, {email: $scope.user.email, role: 1});
      return isAdmin;
    }

    function start() {
      vm.loading = true;
    }

    function end() {
      vm.loading = false;
    }

    init();
  }
})();
