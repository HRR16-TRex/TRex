angular.module("app", [
  "angular-flipclock"
  ])
  .controller("AppController", function($scope){
    var trigger = function(x){
      console.log(x);
    }
    trigger($scope); 

  })