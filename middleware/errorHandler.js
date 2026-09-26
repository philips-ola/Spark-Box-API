export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode :500;

    res.json({
        message: err.message,
        status: statusCode,
        stack: process.env.MODE_ENV === 'production' ? null : err.stack,
    })
}
