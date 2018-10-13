db.users.aggregate([{
        $match: {
            "role": {
                "$exists": false
            },
            "created": {
                $gt: new Date(Date.now() - 24*60*60 * 1000*365)
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
            $gt: new Date(Date.now() - 24*60*60 * 1000*365)
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