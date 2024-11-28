import * as anchor from "@coral-xyz/anchor";
const { SystemProgram } = anchor.web3;

describe("stablex", () => {
    const provider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);

    const program = anchor.workspace.Stablex;

    let marketAccount = anchor.web3.Keypair.generate();
    let userAccount = anchor.web3.Keypair.generate();

    it("Initializes the market", async () => {
        await program.rpc.initializeMarket(new anchor.BN(100), {
            accounts: {
                market: marketAccount.publicKey,
                authority: provider.wallet.publicKey,
                systemProgram: SystemProgram.programId,
            },
            signers: [marketAccount],
        });
        const market = await program.account.market.fetch(marketAccount.publicKey);
        console.log("Market initialized:", market);
    });

    it("Places an order", async () => {
        await program.rpc.placeOrder(new anchor.BN(120), {
            accounts: {
                market: marketAccount.publicKey,
                user: userAccount.publicKey,
            },
            signers: [userAccount],
        });
        const user = await program.account.user.fetch(userAccount.publicKey);
        console.log("User balance after penalty:", user.balance);
    });
});
