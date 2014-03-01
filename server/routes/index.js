
/*
 * GET home page.
 */

exports.index = function(req, res){
    // res.send(500);
    res.jsonp({a: 'b'});
    // setTimeout(function () {
    //     res.jsonp({a: 'b'});
    // }, 10000);
};
