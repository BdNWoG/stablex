use anchor_lang::prelude::*;

declare_id!("28S1rer3Jw4euMRgWAbTzWqefojQhKgJPAnwSW1jMcaz");

#[program]
pub mod stablex {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
