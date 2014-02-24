
/*
 * GET home page.
 */

exports.index = function(req, res){
    // res.send(204);
    res.jsonp({a: 'b'});
    // setTimeout(function () {
    //     res.jsonp({a: 'b'});
    // }, 1000);
};
