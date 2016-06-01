angular.module('app.services', [])

.factory('servicesFactory', function ($http, $location) {
    
  var factorySignIn = function(username, racename){
    console.log("signIn on factory working");
    var data = {
      username: username,
      racename: racename
    };
    console.log(data);
    return $http({
      method: 'POST',
      url: '/api/signin',
      data: data
    })
    .then(function (res) {
      console.log(res);
      return res.data;
    });
  };

  var signout = function () {
    $location.path('/signin');
  };

  return {
    factorySignIn: factorySignIn,
    signout: signout
  };
});