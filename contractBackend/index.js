const {
	Client,
	AccountBalance,
	AccountId,
	FileCreateTransaction,
	ContractCallQuery,
	ContractCreateTransaction,
	ContractFunctionParameters,
	ContractExecuteTransaction,
	ContractFunctionSelector,
	AccountCreateTransaction,
	FileAppendTransaction,
	Hbar,
	PrivateKey,
	AccountBalanceQuery,
	TransferTransaction,
} = require("@hashgraph/sdk");
require("dotenv").config();
const fs = require("fs");

const opId = AccountId.fromString(process.env.ACCOUNT_ID);
const opKey = PrivateKey.fromString(process.env.ACCOUNT_PRIVATE_KEY);

const client = Client.forTestnet().setOperator(opId, opKey);

async function main() {
	const contactByteCode = fs.readFileSync("LoverVerse_sol_LoverVerse.bin");
	// abi = JSON.parse(fs.readFileSync("LoverVerse_sol_LoverVerse.abi", "utf8"));
	// console.log(contactByteCode);

	const fileCreateTx = new FileCreateTransaction()
		.setKeys([opKey])
		.setContents("[e2e::FileCreateTransaction]")
		.setMaxTransactionFee(new Hbar(5));
	const fileSubmit = await fileCreateTx.execute(client);
	const fileCreateRx = await fileSubmit.getReceipt(client);
	const bytecodeFileId = fileCreateRx.fileId;

	const fileAppendTx = await new FileAppendTransaction()
		.setFileId(bytecodeFileId)
		.setNodeAccountIds([fileSubmit.nodeId])
		.setContents(contactByteCode)
		.setMaxChunks(60)
		.setMaxTransactionFee(new Hbar(5));

	const fileAppendSubmit = await fileAppendTx.execute(client);
	const fileAppendRx = await fileAppendSubmit.getReceipt(client);
	console.log(`- Content added: ${fileAppendRx.status} \n`);
	// const fileCreateSign = await fileCreateTxn.sign(opKey);
	// const fileCreateSubmit = await fileCreateSign.execute(client);
	// const filecreateRx = await fileCreateSubmit.getReceipt(client);
	// const byteCodeFileId = fileAppendRx.fileId;
	// console.log("byteCodeFileId", fileAppendRx.fileId);

	const contractCreateTxn = new ContractCreateTransaction()
		.setBytecodeFileId(bytecodeFileId)
		.setGas(1000);

	const contractCreateSign = await contractCreateTxn.execute(client);
	const contractCreateSubmit = await contractCreateSign.getReceipt(client);

	const contractId = contractCreateSubmit.contractId;
	const contractAddress = contractId.toSolidityAddress();
	console.log("contractAddress", contractAddress);
	console.log("contractId", contractId);

	// const contractQuery = new ContractCallQuery()
	// 	.setContractId(contractId)
	// 	.setGas(1000)
	// 	.setFunction("getBuildings")
	// 	.setMaxQueryPayment(new Hbar(0.000001));
	// const contractQuerySign = await contractQuery.execute(client);
	// // const contractQuerySubmit = await contractQuerySign
}

main();

// function test(){
// 	const client = Client.forTestnet();

// 	const myAccount = process.env.ACCOUNT_ID;
// 	const myPrivateKey = process.env.ACCOUNT_PRIVATE_KEY;
// 	if (myAccount == null || myPrivateKey == null) {
// 		throw new Error("ACCOUNT_ID and ACCOUNT_PRIVATE_KEY must be set in .env");
// 	}
// 	client.setOperator(myAccount, myPrivateKey);

// 	const newAccountPrivateKey = await PrivateKey.generateED25519();
// 	const newAccountPublicKey = newAccountPrivateKey.publicKey;

// 	const newAccount = await new AccountCreateTransaction()
// 		.setKey(newAccountPublicKey)
// 		.setInitialBalance(Hbar.fromTinybars(1000))
// 		.execute(client);

// 	const getReciept = await newAccount.getReceipt(client);
// 	const newAccountID = getReciept.accountId;

// 	console.log(`New account created with ID: ${newAccountID}`);

// 	const AccountBalance = await new AccountBalanceQuery()
// 		.setAccountId(myAccount)
// 		.execute(client);

// 	console.log(`Account balance: ${AccountBalance.hbars.toTinybars()}`);

// 	const sendMoney = await new TransferTransaction()
// 		.addHbarTransfer(myAccount, Hbar.fromTinybars(-1000))
// 		.addHbarTransfer(newAccountID, Hbar.fromTinybars(1000))
// 		.execute(client);

// 	const txnReceipt = await sendMoney.getReceipt(client);
// 	console.log(txnReceipt.status.toString());
// 	const cost = await new AccountBalanceQuery()
// 		.setAccountId(newAccountID)
// 		.getCost(client);
// 	console.log(`Cost: ${cost}`);
// 	const newAccountBalnce = await new AccountBalanceQuery()
// 		.setAccountId(newAccountID)
// 		.execute(client);
// 	console.log(`New Account balance: ${newAccountBalnce.hbars.toTinybars()}`);
// }
