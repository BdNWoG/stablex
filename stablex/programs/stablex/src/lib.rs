use anchor_lang::prelude::*;

declare_id!("YourProgramID");

#[program]
pub mod stablex {
    use super::*;

    pub fn initialize_market(ctx: Context<InitializeMarket>, price: u64) -> Result<()> {
        let market = &mut ctx.accounts.market;
        market.current_price = price;
        market.penalty_coefficient = 10; // Example value
        market.time_sensitivity = 1000; // Example value
        Ok(())
    }

    pub fn place_order(ctx: Context<PlaceOrder>, order_price: u64) -> Result<()> {
        let market = &ctx.accounts.market;
        let user = &mut ctx.accounts.user;

        let delta_price = (order_price as i64 - market.current_price as i64).abs();
        let time_since_last_tx = Clock::get()?.unix_timestamp - user.last_transaction;

        // Calculate penalties
        let price_penalty = market.penalty_coefficient as u64 * (delta_price as u64).exp();
        let time_penalty = price_penalty * (1 + market.time_sensitivity / time_since_last_tx);

        // Deduct penalties from the user
        let total_penalty = price_penalty + time_penalty;
        user.balance -= total_penalty;
        user.last_transaction = Clock::get()?.unix_timestamp;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeMarket<'info> {
    #[account(init, payer = authority, space = 8 + 40)]
    pub market: Account<'info, Market>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceOrder<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub user: Account<'info, User>,
}

#[account]
pub struct Market {
    pub current_price: u64,
    pub penalty_coefficient: f64,
    pub time_sensitivity: u64,
}

#[account]
pub struct User {
    pub balance: u64,
    pub last_transaction: i64,
}
