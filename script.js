const API = "http://localhost:3000";

let accountId = null;
let pendingOperation = null;


/* =========================
   LOGIN
========================= */

async function login() {

    const accountNumber =
        document.getElementById("loginAccountNumber").value.trim();

    const pin =
        document.getElementById("loginPin").value;

    const loginMessage =
        document.getElementById("loginMessage");

    if (!accountNumber || !pin) {
        loginMessage.innerText =
            "Please enter account number and PIN.";
        return;
    }

    if (!/^\d{4}$/.test(pin)) {
        loginMessage.innerText =
            "PIN must be exactly 4 digits.";
        return;
    }

    try {

        const response = await fetch(
            `${API}/api/accounts/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    account_number: accountNumber,
                    pin: pin
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            loginMessage.innerText =
                data.message || "Login failed.";
            return;
        }

        accountId = data.account_id;

        document.getElementById("customerName").innerText =
            data.customer_name;

        document.getElementById("loginScreen").style.display =
            "none";

        loadAccount();
        loadTransactions();

    } catch (error) {

        console.error(error);

        loginMessage.innerText =
            "Unable to connect to server.";
    }
}


/* =========================
   LOAD ACCOUNT
========================= */

async function loadAccount() {

    try {

        const response = await fetch(
            `${API}/api/accounts/${accountId}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load account"
            );
        }

        document.getElementById("balance").innerText =
            `₹${Number(data.balance).toFixed(2)}`;

        document.getElementById("accountNumber").innerText =
            data.account_number;

    } catch (error) {

        console.error(error);

        document.getElementById("balance").innerText =
            "Unable to load";

        document.getElementById("accountNumber").innerText =
            "Error";
    }
}


/* =========================
   PIN SECURITY
========================= */

function requestPin(operation) {

    pendingOperation = operation;

    document.getElementById("pinInput").value = "";

    document.getElementById("pinMessage").innerText =
        "Enter your 4-digit PIN to continue.";

    document.getElementById("pinModal").style.display =
        "flex";

    setTimeout(() => {
        document.getElementById("pinInput").focus();
    }, 100);
}


function closePinModal() {

    document.getElementById("pinModal").style.display =
        "none";

    pendingOperation = null;
}


async function verifyPinAndContinue() {

    const pin =
        document.getElementById("pinInput").value;

    if (!/^\d{4}$/.test(pin)) {

        document.getElementById("pinMessage").innerText =
            "Please enter a valid 4-digit PIN.";

        return;
    }

    try {

        const response = await fetch(
            `${API}/api/accounts/${accountId}/verify-pin`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    pin: pin
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            document.getElementById("pinMessage").innerText =
                data.message || "Incorrect PIN.";

            document.getElementById("pinInput").value = "";

            return;
        }

        const operation = pendingOperation;

        document.getElementById("pinModal").style.display =
            "none";

        document.getElementById("pinInput").value = "";

        pendingOperation = null;

        if (operation === "deposit") {
            openDepositModal();

        } else if (operation === "withdraw") {
            openWithdrawModal();

        } else if (operation === "transfer") {
            openTransferModal();

        } else if (operation === "statement") {
            openStatementModal();
        }

    } catch (error) {

        console.error(error);

        document.getElementById("pinMessage").innerText =
            "Unable to verify PIN.";
    }
}


/* =========================
   DEPOSIT
========================= */

function showDeposit() {
    requestPin("deposit");
}


function openDepositModal() {

    document.getElementById("operationContent").innerHTML = `

        <div class="modal-icon">💰</div>

        <h2>Deposit Money</h2>

        <p>Add money to your account.</p>

        <input
            type="number"
            id="depositAmount"
            placeholder="Enter amount"
            min="1"
        >

        <button
            class="modal-submit"
            onclick="depositMoney()"
        >
            Deposit Money
        </button>

    `;

    document.getElementById("operationModal").style.display =
        "flex";
}


async function depositMoney() {

    const amount =
        Number(
            document.getElementById("depositAmount").value
        );

    if (!amount || amount <= 0) {

        alert("Please enter a valid amount.");

        return;
    }

    try {

        const response = await fetch(
            `${API}/api/accounts/${accountId}/deposit`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    amount: amount
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            alert(
                data.message || "Deposit failed."
            );

            return;
        }

        alert(
            `Deposit successful!\nNew Balance: ₹${Number(data.new_balance).toFixed(2)}`
        );

        closeOperationModal();

        loadAccount();
        loadTransactions();

    } catch (error) {

        console.error(error);

        alert("Server error.");
    }
}


/* =========================
   WITHDRAW
========================= */

function showWithdraw() {
    requestPin("withdraw");
}


function openWithdrawModal() {

    document.getElementById("operationContent").innerHTML = `

        <div class="modal-icon">💸</div>

        <h2>Withdraw Money</h2>

        <p>Withdraw money from your account.</p>

        <input
            type="number"
            id="withdrawAmount"
            placeholder="Enter amount"
            min="1"
        >

        <button
            class="modal-submit"
            onclick="withdrawMoney()"
        >
            Withdraw Money
        </button>

    `;

    document.getElementById("operationModal").style.display =
        "flex";
}


async function withdrawMoney() {

    const amount =
        Number(
            document.getElementById("withdrawAmount").value
        );

    if (!amount || amount <= 0) {

        alert("Please enter a valid amount.");

        return;
    }

    try {

        const response = await fetch(
            `${API}/api/accounts/${accountId}/withdraw`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    amount: amount
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            alert(
                data.message || "Withdrawal failed."
            );

            return;
        }

        alert(
            `Withdrawal successful!\nNew Balance: ₹${Number(data.new_balance).toFixed(2)}`
        );

        closeOperationModal();

        loadAccount();
        loadTransactions();

    } catch (error) {

        console.error(error);

        alert("Server error.");
    }
}


/* =========================
   TRANSFER
========================= */

function showTransfer() {
    requestPin("transfer");
}


/* =========================
   FIND RECEIVER
========================= */

async function findReceiver() {

    const receiverInput =
        document.getElementById("toAccount");

    const receiverInfo =
        document.getElementById("receiverInfo");

    const accountNumber =
        receiverInput.value.trim();

    if (!accountNumber) {

        receiverInfo.innerHTML = "";

        return;
    }

    receiverInfo.innerHTML =
        `<span style="color:#718096;">Checking account...</span>`;

    try {

        /*
         * Get all accounts and find the receiver
         * using the account NUMBER.
         */

        const response = await fetch(
            `${API}/api/accounts`
        );

        const data = await response.json();

        if (!response.ok) {

            receiverInfo.innerHTML =
                `<span style="color:#dc3545;">Unable to find account.</span>`;

            return;
        }

        /*
         * Support both:
         * data = [...]
         * and
         * data.accounts = [...]
         */

        const accounts =
            Array.isArray(data)
                ? data
                : data.accounts || [];

        const receiver =
            accounts.find(
                account =>
                    String(account.account_number) ===
                    String(accountNumber)
            );

        if (!receiver) {

            receiverInfo.innerHTML = `
                <div style="
                    margin-top:10px;
                    padding:10px;
                    background:#fff1f1;
                    border-radius:8px;
                    color:#c62828;
                    font-size:13px;
                ">
                    ❌ Receiver account not found
                </div>
            `;

            return;
        }

        if (
            Number(receiver.account_id) ===
            Number(accountId)
        ) {

            receiverInfo.innerHTML = `
                <div style="
                    margin-top:10px;
                    padding:10px;
                    background:#fff7e6;
                    border-radius:8px;
                    color:#b26a00;
                    font-size:13px;
                ">
                    ⚠️ You cannot transfer to your own account.
                </div>
            `;

            return;
        }

        receiverInfo.innerHTML = `
            <div style="
                margin-top:10px;
                padding:12px;
                background:#eef8f1;
                border-radius:10px;
                color:#247542;
            ">

                <strong>
                    ✓ Receiver Found
                </strong>

                <br>

                <span style="font-size:14px;">
                    ${receiver.customer_name}
                </span>

                <br>

                <small>
                    Account: ${receiver.account_number}
                </small>

            </div>
        `;

    } catch (error) {

        console.error(error);

        receiverInfo.innerHTML =
            `<span style="color:#dc3545;">Unable to check receiver.</span>`;
    }
}


/* =========================
   TRANSFER MODAL
========================= */

function openTransferModal() {

    document.getElementById("operationContent").innerHTML = `

        <div class="modal-icon">🔄</div>

        <h2>Transfer Money</h2>

        <p>Send money securely to another account.</p>

        <input
            type="number"
            id="toAccount"
            placeholder="Receiver Account Number"
            min="1"
            oninput="findReceiver()"
        >

        <div id="receiverInfo"></div>

        <input
            type="number"
            id="transferAmount"
            placeholder="Enter amount"
            min="1"
            style="margin-top:15px;"
        >

        <button
            class="modal-submit"
            onclick="transferMoney()"
        >
            Transfer Money
        </button>

    `;

    document.getElementById("operationModal").style.display =
        "flex";
}


/* =========================
   TRANSFER MONEY
========================= */

async function transferMoney() {

    const toAccount =
        Number(
            document.getElementById("toAccount").value
        );

    const amount =
        Number(
            document.getElementById("transferAmount").value
        );

    if (!toAccount || !amount || amount <= 0) {

        alert(
            "Please enter valid transfer details."
        );

        return;
    }

    if (toAccount === accountId) {

        alert(
            "You cannot transfer money to the same account."
        );

        return;
    }

    try {

        const response = await fetch(
            `${API}/api/accounts/transfer`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    from_account: accountId,
                    to_account: toAccount,
                    amount: amount
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            alert(
                data.message || "Transfer failed."
            );

            return;
        }

        alert(
            `Transfer successful!\n₹${amount.toFixed(2)} sent to account ${toAccount}.`
        );

        closeOperationModal();

        loadAccount();
        loadTransactions();

    } catch (error) {

        console.error(error);

        alert("Server error.");
    }
}


/* =========================
   STATEMENT
========================= */

function showStatement() {
    requestPin("statement");
}


async function openStatementModal() {

    document.getElementById("operationContent").innerHTML = `

        <div class="modal-icon">📜</div>

        <h2>Transaction Statement</h2>

        <p>Loading transactions...</p>

    `;

    document.getElementById("operationModal").style.display =
        "flex";

    try {

        const response = await fetch(
            `${API}/api/accounts/${accountId}/transactions`
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load statement"
            );
        }

        if (
            !data.transactions ||
            data.transactions.length === 0
        ) {

            document.getElementById(
                "operationContent"
            ).innerHTML = `

                <div class="modal-icon">📜</div>

                <h2>Transaction Statement</h2>

                <p>No transactions found.</p>

            `;

            return;
        }

        let html = `

            <div class="modal-icon">📜</div>

            <h2>Transaction Statement</h2>

            <div style="
                max-height:300px;
                overflow-y:auto;
                text-align:left;
                margin-top:20px;
            ">

        `;

        data.transactions.forEach(
            transaction => {

                const type =
                    transaction.transaction_type;

                const amount =
                    Number(
                        transaction.amount
                    ).toFixed(2);

                const date =
                    new Date(
                        transaction.transaction_date
                    ).toLocaleString();

                const className =
                    type === "DEPOSIT"
                        ? "credit"
                        : "debit";

                html += `

                    <div class="transaction-item">

                        <div>

                            <strong>
                                ${type}
                            </strong>

                            <br>

                            <small>
                                ${transaction.description || "Transaction"}
                            </small>

                            <br>

                            <small>
                                ${date}
                            </small>

                        </div>

                        <strong class="${className}">
                            ₹${amount}
                        </strong>

                    </div>

                `;
            }
        );

        html += `</div>`;

        document.getElementById(
            "operationContent"
        ).innerHTML = html;

    } catch (error) {

        console.error(error);

        document.getElementById(
            "operationContent"
        ).innerHTML = `

            <div class="modal-icon">⚠️</div>

            <h2>Error</h2>

            <p>
                Unable to load transaction statement.
            </p>

        `;
    }
}


/* =========================
   CLOSE OPERATION MODAL
========================= */

function closeOperationModal() {

    document.getElementById(
        "operationModal"
    ).style.display = "none";

    document.getElementById(
        "operationContent"
    ).innerHTML = "";
}


/* =========================
   LOAD TRANSACTIONS
========================= */

async function loadTransactions() {

    try {

        const response = await fetch(
            `${API}/api/accounts/${accountId}/transactions`
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load transactions"
            );
        }

        const transactionList =
            document.getElementById(
                "transactionList"
            );

        if (
            !data.transactions ||
            data.transactions.length === 0
        ) {

            transactionList.innerHTML =
                "<p>No transactions yet.</p>";

            return;
        }

        let html = "";

        data.transactions
            .slice(0, 5)
            .forEach(transaction => {

                const type =
                    transaction.transaction_type;

                const amount =
                    Number(
                        transaction.amount
                    ).toFixed(2);

                const date =
                    new Date(
                        transaction.transaction_date
                    ).toLocaleString();

                const className =
                    type === "DEPOSIT"
                        ? "credit"
                        : "debit";

                html += `

                    <div class="transaction-item">

                        <div>

                            <strong>
                                ${type}
                            </strong>

                            <br>

                            <small>
                                ${transaction.description || "Transaction"}
                            </small>

                            <br>

                            <small>
                                ${date}
                            </small>

                        </div>

                        <strong class="${className}">
                            ₹${amount}
                        </strong>

                    </div>

                `;
            });

        transactionList.innerHTML = html;

    } catch (error) {

        console.error(error);

        document.getElementById(
            "transactionList"
        ).innerHTML =
            "<p>Unable to load transactions.</p>";
    }
}


/* =========================
   LOGOUT
========================= */

function logout() {

    accountId = null;

    pendingOperation = null;

    document.getElementById(
        "loginAccountNumber"
    ).value = "";

    document.getElementById(
        "loginPin"
    ).value = "";

    document.getElementById(
        "loginMessage"
    ).innerText = "";

    document.getElementById(
        "loginScreen"
    ).style.display = "flex";

    document.getElementById(
        "balance"
    ).innerText = "₹0.00";

    document.getElementById(
        "accountNumber"
    ).innerText = "Loading...";

    document.getElementById(
        "customerName"
    ).innerText = "Customer";

    document.getElementById(
        "transactionList"
    ).innerHTML =
        "<p>No transactions loaded.</p>";
}