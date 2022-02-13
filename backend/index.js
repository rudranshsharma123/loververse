// console.clear();

import "dotenv/config";

import {
	AccountId,
	PrivateKey,
	Client,
	TokenCreateTransaction,
	TokenInfoQuery,
	TokenType,
	CustomRoyaltyFee,
	CustomFixedFee,
	Hbar,
	TokenSupplyType,
	TokenMintTransaction,
	TokenBurnTransaction,
	TransferTransaction,
	AccountBalance,
	AccountBalanceQuery,
	AccountUpdateTransaction,
	TokenAssociateTransaction,
	AccountCreateTransaction,
	TokenNftInfoQuery,
	TokenId,
	NftId,
	TokenInfo,
	TokenNftInfo,
} from "@hashgraph/sdk";

import express from "express";
const operatorId = AccountId.fromString(process.env.ACCOUNT_ID);
const operatorKey = PrivateKey.fromString(process.env.ACCOUNT_PRIVATE_KEY);
const treasuryId = AccountId.fromString(process.env.TREASURY_ID);
const treasuryKey = PrivateKey.fromString(process.env.TREASURY_PRIVATE_KEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);
const supplyKey = PrivateKey.generate();
const adminKey = PrivateKey.generate();

const app = express();
const port = 3001;
let nftCreate = await new TokenCreateTransaction()
	.setTokenName("LoverVerse")
	.setTokenSymbol("LOVE")
	.setTokenType(TokenType.NonFungibleUnique)
	.setDecimals(0)
	.setInitialSupply(0)
	.setTreasuryAccountId(treasuryId)
	.setSupplyType(TokenSupplyType.Finite)
	.setMaxSupply(12)
	.setSupplyKey(supplyKey)
	.setAdminKey(adminKey)
	.freezeWith(client)
	.sign(treasuryKey);
// Sign the transaction with the treasury key
let nftCreateTxSign = await nftCreate.sign(adminKey);

//Submit the transaction to a Hedera network
let nftCreateSubmit = await nftCreateTxSign.execute(client);

//Get the transaction receipt
let nftCreateRx = await nftCreateSubmit.getReceipt(client);

//Get the token ID
let tokenId = nftCreateRx.tokenId;

//Log the token ID
console.log(`- Created NFT with Token ID: ${tokenId} \n`);
console.log("Starting Initial Mint of 12 Places");

let mintedTokenIds = [];

// Mint 12 places
for (let i = 0; i < 12; i++) {
	let min = await mint("i", tokenId);
	console.log(min.serials[0].low);
	mintedTokenIds.push(min.serials[0].low);
}
let info = await new TokenInfoQuery().setTokenId(tokenId).execute(client);

app.get("/", async (req, res) => {
	// await setConfig();

	res.end("Hello World!");
});

app.get("/account", async (req, res) => {
	const k = await createNewAccount();
	res.send({
		account: k.newAccountID.toString(),
		privateKey: k.newAccountPrivateKey.toString(),
	});
});

app.get("/nfts", async (req, res) => {
	res.send(12);
});

app.post("/asso", async (req, res) => {
	const info = req.body;
	accountID = AccountId.fromString(info["accountId"]);
	privateKey = PrivateKey.fromString(info["privateKey"]);
	let x = await associteAccount(accountID, privateKey);
	let y = await transferNFT(accountID, tokenId);
	res.send("success");
});

app.post("/balance", async (req, res) => {
	const info = req.body;
	accountID = AccountId.fromString(info["accountId"]);
	privateKey = PrivateKey.fromString(info["privateKey"]);
	let x = await balanceChecker(accountID);
	res.send("done");
});

app.listen(port, () => {
	console.log(`app listening at http://localhost:${port}`);
});

async function mint(CID, tokenId) {
	let mintTxn = await new TokenMintTransaction()
		.setTokenId(tokenId)
		.setMetadata([Buffer.from(CID)])
		.freezeWith(client)
		.sign(supplyKey);
	let mintTxSubmit = await mintTxn.execute(client);
	let mintTxReceipt = await mintTxSubmit.getReceipt(client);
	console.log(mintTxReceipt);
	return mintTxReceipt;
}

async function balanceChecker(id) {
	let balance = await new AccountBalanceQuery()
		.setAccountId(id)
		.execute(client);
	return [
		balance.tokens._map.get(tokenId.toString()).toString(),
		balance.hbars.toString(),
	];
}
async function main() {
	// 	let nftCustomFee = await new CustomRoyaltyFee()
	// 		.setNumerator(5)
	// 		.setDenominator(10)
	// 		.setFeeCollectorAccountId(treasuryID)
	// 		.setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(200)));

	let x = await mint("kollldd");

	var tokenInfo = await new TokenInfoQuery()
		.setTokenId(tokenId)
		.execute(client);
	console.table(tokenInfo.totalSupply);
	console.log(tokenInfo.totalSupply);
	// let nftCreateSign = await nftCreate.sign(adminKey);
	// let nftCreateSubmit = await nftCreate.execute(client);
	// let nftCreateReceipt = await nftCreateSubmit.getReceipt(client);
	// let tokenId = nftCreateReceipt.tokenId;
	// console.log(tokenId);
	let a = await balanceChecker(treasuryId);
	console.log(a);

	let k = await createNewAccount();
	console.log(k.newAccountID, k.newAccountPrivateKey);
	let ans = await associteAccount(
		k.newAccountID,
		k.newAccountPrivateKey,
		tokenId,
	);
	console.log(ans);
	let l = await transferNFT(k.newAccountID, tokenId);
	let m = await balanceChecker(k.newAccountID);
	console.log(m);
	let z = await balanceChecker(treasuryId);
	console.log(z);
}
// main();
async function createNewAccount() {
	// const client = Client.forTestnet();

	// const myAccount = process.env.ACCOUNT_ID;
	// const myPrivateKey = process.env.ACCOUNT_PRIVATE_KEY;
	// if (myAccount == null || myPrivateKey == null) {
	// 	throw new Error("ACCOUNT_ID and ACCOUNT_PRIVATE_KEY must be set in .env");
	// }
	// client.setOperator(myAccount, myPrivateKey);

	const newAccountPrivateKey = await PrivateKey.generate();
	console.log(newAccountPrivateKey.toString());
	const newAccountPublicKey = newAccountPrivateKey.publicKey;
	console.log(newAccountPublicKey.toString());

	const newAccount = await new AccountCreateTransaction()
		.setKey(newAccountPublicKey)
		.setInitialBalance(Hbar.fromTinybars(1000))
		.execute(client);

	const getReciept = await newAccount.getReceipt(client);
	const newAccountID = getReciept.accountId;

	console.log(`New account created with ID: ${newAccountID}`);
	return {
		newAccountID: newAccountID,
		newAccountPrivateKey: newAccountPrivateKey,
	};
}
async function transferNFT(to, tokenId) {
	let transfer = await new TransferTransaction()
		.addNftTransfer(tokenId, 1, treasuryId, to)
		.freezeWith(client)
		.sign(treasuryKey);
	let transferSubmit = await transfer.execute(client);
	let transferReceipt = await transferSubmit.getReceipt(client);

	console.log(
		`\n- NFT transfer from Treasury to Alice: ${transferReceipt.status} \n`,
	);
}
async function associteAccount(accountID, privateKey, tokenId) {
	let associta = await new TokenAssociateTransaction()
		.setAccountId(accountID)
		.setTokenIds([tokenId])
		.freezeWith(client)
		.sign(privateKey);
	let associtaSubmit = await associta.execute(client);
	let associtaReceipt = await associtaSubmit.getReceipt(client);
	console.log(associtaReceipt.status.toString());
	return associtaReceipt.status.toString();
}

// createNewAccount();
// 	// const AccountBalance = await new AccountBalanceQuery()
// 	// 	.setAccountId(myAccount)
// 	// 	.execute(client);

// 	// console.log(`Account balance: ${AccountBalance.hbars.toTinybars()}`);

// 	// const sendMoney = await new TransferTransaction()
// 	// 	.addHbarTransfer(myAccount, Hbar.fromTinybars(-1000))
// 	// 	.addHbarTransfer(newAccountID, Hbar.fromTinybars(1000))
// 	// 	.execute(client);

// 	// const txnReceipt = await sendMoney.getReceipt(client);
// 	// console.log(txnReceipt.status.toString());
// 	// const cost = await new AccountBalanceQuery()
// 	// 	.setAccountId(newAccountID)
// 	// 	.getCost(client);
// 	// console.log(`Cost: ${cost}`);
// 	// const newAccountBalnce = await new AccountBalanceQuery()
// 	// 	.setAccountId(newAccountID)
// 	// 	.execute(client);
// 	// console.log(`New Account balance: ${newAccountBalnce.hbars.toTinybars()}`);
// }

// test();
