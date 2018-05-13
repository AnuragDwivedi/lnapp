var ValidateAccess = function() {};

ValidateAccess.prototype.hasGetOrdersAccess = function(user) {
    if(user.role === "Admin" || user.role === "Manager" || user.role === "PD") {
        return true;
    }

    return false;
};

ValidateAccess.prototype.hasNonCustomerRole = function(user) {
    if(user.role === "Admin" || user.role === "Manager" || user.role === "PD") {
        return true;
    }

    return false;
};

module.exports = ValidateAccess;