module.exports = function wrapAcync(fn){
    return function(req, res, next){
        fn(req, res, next).catch(next);
    }
}