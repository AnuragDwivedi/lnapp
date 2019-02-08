db.users.aggregate([{
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
            "_id.year": -1,
            "_id.month": -1
        }
    }
]);

db.generalorders.aggregate([{
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
            "_id.year": -1,
            "_id.month": -1
        }
    }
]);

db.commercialorders.aggregate([{
    $match: {
        $and: [{
            "created": {
                $gt: new Date(2018, 8, 1)
            }
        }, {
            "created": {
                $lt: new Date(2018, 9, 0)
            }
        }]
    }
},
{
    $unwind: "$data.items"
},
{
    $group: {
        _id: "$commercialLeadId",
        count: {
            $sum: 1
        }
    }
},
{
    $sort: {
        "_id": -1
    }
}
]);

db.commercialorders.find({
    $and: [{
        "created": {
            $gt: new Date(2018, 8, 1)
        }
    }, {
        "created": {
            $lt: new Date(2018, 9, 0)
        }
    }]
})