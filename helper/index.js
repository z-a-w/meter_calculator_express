exports.respondToUser = function (res, err, data) {
    if (err) res.status(500).json(err);
    else if (!data) res.status(404);
    res.status(200).json(data)
}

exports.respondStatusToUser = function (res, err, data, status) {
    if (err) res.status(500).json(err)
    else if (!data) res.status(404);
    res.status(200).json(status)
}