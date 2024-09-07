const tryCatch = controller => (req, res, next) => {
    try {
        controller(req, res, next);
    } catch (err) {
        console.error(err); 
        next(err);
    }
};

const tryCatchAsync = controller => async (req, res, next) => {
    try {
        await controller(req, res, next); 
    } catch (err) {
        console.error(err);
        next(err);
    }
};

module.exports = {
    tryCatch,
    tryCatchAsync
};
