(function () {
  angular
    .module("app")
    .directive("taggable", function(tagsService, toastr) {
      return {
        templateUrl: "app/partials/taggable.html",
        restrict: "E",
        scope: {
          taggableId: "@",
          taggableType: "@",
          onTagAdded: "&"
        },
        link: function(scope, element, attrs) {
          scope.addTag = addTag;
          scope.newTag = {
            color: "#4f8ff7",
            name: ""
          };

          function addTag() {
            if (!scope.newTag.name) return;
            var tagDetails = {
              taggable_id: scope.taggableId,
              taggable_type: scope.taggableType,
              tag: scope.newTag
            };

            tagsService.createTag(tagDetails)
            .then(function(data) {
              toastr.success("Well Done! Tags updated");
              scope.newTag.color = "#4f8ff7";
              scope.newTag.name = "";
            }).finally(scope.onTagAdded || angular.noop);
          }
        }
      };
    });
})();
