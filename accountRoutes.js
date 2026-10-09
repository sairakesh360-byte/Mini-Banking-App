const express = require("express");
const router = express.Router();

const accountController = require("../controllers/accountController");

// Create account
router.post("/", accountController.createAccount);

// Get all accounts
router.get("/", accountController.getAccounts);

// Get account by ID
router.get("/:id", accountController.getAccountById);

// PIN routes
router.post("/:id/set-pin", accountController.setPin);

router.post("/:id/verify-pin", accountController.verifyPin);

// Login
router.post("/login", accountController.login);

module.exports = router;