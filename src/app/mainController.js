/**
 * Created by nothing on 05/08/2016.
 */
angular.module('demoApp',[])
    .controller('mainController', function($scope){
        $scope.selectTheme = [
            {name : 'Theme-One', url: 'theme-one'},
            {name : 'Theme-Two', url: 'theme-two'}
        ]

        $scope.theme= $scope.selectTheme[0];


    })