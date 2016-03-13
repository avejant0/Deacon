'use strict'
var projectControllers = angular.module('projectControllers',[]);
projectControllers.controller('ProjectListCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
	if (!$scope.$parent.isAuthenticated) 
	{
		$location.path('/');
		return;
	}


	$http.get('/api/projects').success(function(data) {
      	$scope.projects = angular.fromJson(data); 
  	});
}]);

projectControllers.controller('ProjectCtrl', ['$scope', '$http', '$location', '$routeParams', function ($scope, $http, $location, $routeParams) {
	if (!$scope.$parent.isAuthenticated) 
	{
		$location.path('/');
		return;
	}


	$http.get('/api/projects/'+ $routeParams.id).success(function(data) {
      	$scope.project = angular.fromJson(data); 
      	$http.get('/api/issuesOfProject/' + $scope.project._id).success(function(data) {
  			$scope.issues = angular.fromJson(data);
  		});
  	});

}]);



projectControllers.controller("addProjectModalController", ['$scope', '$uibModal',

    function ($scope, $uibModal) {

        $scope.showForm = function () {
            $scope.message = "Show Form Button Clicked";
            console.log($scope.message);

            var modalInstance = $uibModal.open({
                templateUrl: '/app/layouts/modals/addProjectModal.html',
                controller: AddProjectModalInstanceCtrl,
                scope: $scope,
                resolve: {
                    projectForm: function () {
                        return $scope.projectForm;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
            });
        };
}]);

var AddProjectModalInstanceCtrl = function ($scope, $uibModalInstance, $http, $location, projectForm) {
    $scope.addProject = function () {
    	$scope.projectForm.projectManager = $scope.user;
    	if ($scope.projectForm.$valid) {
			$http.post('/api/projects', $scope.projectForm).success(function(data) {
                $location.url('/projects/');
                $uibModalInstance.close('closed');
        	}).error(function(data) {
           		$location.path('/');
        	})
        }
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
};