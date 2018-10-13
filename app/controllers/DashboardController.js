var DashboardController = function () {};
var User = require('../models/UserModel');
var GeneralOrder = require('../models/GeneralOrderModel');
var ValidateAccess = require('../../utils/ValidateAccess');
var accessUtils = new ValidateAccess();

/**
 * New customers monthly
 */
DashboardController.prototype.getCustomersMonthly = function (req, res, next) {
    if (req.user && accessUtils.hasNonCustomerRole(req.user)) {
        User.aggregate([{
                $match: {
                    "role": {
                        "$exists": false
                    },
                    "created": {
                        $gt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 365)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        month: {
                            $month: "$created"
                        },
                        year: {
                            $year: "$created"
                        }
                    },
                    count: {
                        $sum: 1
                    }
                }
            }, {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            }
        ])
        .exec(function (err, custByMonth) {
			if (err) {
				return next(err);
			} else {
				return res.json(custByMonth);
			}
		});
    } else {
        console.log("401");
        return res.send(401, "Unauthorized");
    }
};

/**
 * Orders monthly
 */
DashboardController.prototype.getOrdersMonthly = function (req, res, next) {
    if (req.user && accessUtils.hasNonCustomerRole(req.user)) {
        GeneralOrder.aggregate([{
                $match: {
                    "created": {
                        $gt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 365)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        month: {
                            $month: "$created"
                        },
                        year: {
                            $year: "$created"
                        }
                    },
                    count: {
                        $sum: 1
                    }
                }
            }, {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            }
        ])
        .exec(function (err, ordersByMonth) {
			if (err) {
				return next(err);
			} else {
				return res.json(ordersByMonth);
			}
		});
    } else {
        console.log("401");
        return res.send(401, "Unauthorized");
    }
};

module.exports = DashboardController;