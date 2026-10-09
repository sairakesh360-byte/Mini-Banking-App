const express = require("express");
const router = express.Router();

const transactionController = require("../controllers/transactioncontroller");

// Deposit money
router.post(
    "/accounts/:id/deposit",
    transactionController.deposit
);

// Withdraw money
router.post(
    "/accounts/:id/withdraw",
    transactionController.withdraw
);

// Transfer money
router.post(
    "/accounts/transfer",
    transactionController.transfer
);

// Get transaction statement
router.get("/accounts/:id/transactions", transactionController.getTransactions);

// Get account statistics
router.get("/accounts/:id/stats", transactionController.getStats);

module.exports = router;




