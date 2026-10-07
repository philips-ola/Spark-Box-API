export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode && res.statusCode >= 400 ? res.statusCode : 500;

    res.status(statusCode).json({
        message: err.message,
        status: statusCode,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

