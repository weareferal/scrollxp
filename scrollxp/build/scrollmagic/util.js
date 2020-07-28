var Util;
(function (Util) {
    var floatval = function (number) {
        return parseFloat(number) || 0;
    };
    function testing() {
        console.log('bla');
    }
    Util.testing = testing;
})(Util || (Util = {}));
