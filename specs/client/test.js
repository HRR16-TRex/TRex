'use strict';

describe('AppController', function () {
  var $scope, $rootScope, $location, createController, $httpBackend, Links;

  // using angular mocks, we can inject the injector
  // to retrieve our dependencies
  beforeEach(module('app'));
  beforeEach(inject(function ($injector) {

    // mock out our dependencies
    $rootScope = $injector.get('$rootScope');
    $httpBackend = $injector.get('$httpBackend');
    // Links = $injector.get('Links');
    $location = $injector.get('$location');

    $scope = $rootScope.$new();

    var $controller = $injector.get('$controller');

    createController = function () {
      return $controller('raceController', {
        $scope: $scope,
        // Links: Links, for factories
        $location: $location
      });
    };

    createController();
  }));

  it('should have a startTimer function on the $scope', function () {
    expect($scope.startTimer).to.be.a('function');
  });
  
});