use anchor_lang::{prelude::*, solana_program::clock::Clock};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer, Mint, Token, TokenAccount, Transfer},
};

declare_id!("Ez8TA8T2rEyGjuEy6D6iY7Z7g51mPm4Zz5CRLndfbSjL");

const STAKE_STATE_SEED: &[u8] = b"stake"; // Seed for the player's stake account PDA.
const VAULT_SEED: &[u8] = b"vault"; // Seed for the vault token account PDA.
const TOKEN_SEED: &[u8] = b"token"; // Seed for the player's stake token account PDA.
const STAKE_AMOUNT: u64 = 1; // Amount of tokens to stake.

#[program]
pub mod stake {
    use super::*;

    // Initialize the vault token account that will hold the tokens rewarded to the player for staking.
    // This instruction would only be called once, and then the token account can be refilled with tokens as needed.
    // Alternatively, the vault token account could be initialized in the client with a PDA as the owner.
    // However, the address of the token account would be from a randomly generated keypair that would need to be stored somewhere.
    pub fn initialize_vault(_ctx: Context<InitializeVault>) -> Result<()> {
        Ok(())
    }

    // Initialize the player's token account that will hold the tokens to be staked.
    // This instruction is used for testing frontend to initially fund the player's token account with tokens.
    pub fn airdrop(ctx: Context<Airdrop>) -> Result<()> {
        // Amount of tokens to airdrop, adjusting for the mint decimals.
        let amount = (STAKE_AMOUNT)
            .checked_mul(10u64.pow(ctx.accounts.mint.decimals as u32))
            .unwrap();

        // Vault token account PDA signer
        let bump = *ctx.bumps.get("vault_token_account").unwrap();
        let signer: &[&[&[u8]]] = &[&[VAULT_SEED, &[bump]]];

        // Transfer tokens from vault token account to player's token account.
        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault_token_account.to_account_info(),
                    to: ctx.accounts.player_token_account.to_account_info(),
                    authority: ctx.accounts.vault_token_account.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;
        Ok(())
    }

    // Stake the player's tokens.
    pub fn stake(ctx: Context<Stake>) -> Result<()> {
        let player_stake_account = &mut ctx.accounts.player_stake_account;

        // Return error if the player's already staking.
        if player_stake_account.is_staked {
            return Err(ErrorCode::IsStaked.into());
        }

        // Update the player_stake_account status and timestamp.
        player_stake_account.is_staked = true;
        player_stake_account.timestamp = Clock::get().unwrap().unix_timestamp;

        // Amount of tokens to stake, adjusting for the mint decimals.
        let amount = (STAKE_AMOUNT)
            .checked_mul(10u64.pow(ctx.accounts.mint.decimals as u32))
            .unwrap();

        // Transfer tokens from the player's tokens to the player's stake token account.
        transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.player_token_account.to_account_info(),
                    to: ctx.accounts.player_stake_token_account.to_account_info(),
                    authority: ctx.accounts.player.to_account_info(),
                },
            ),
            amount,
        )?;
        Ok(())
    }

    // Unstake the player's tokens and redeem the staking rewards.
    pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
        let player_stake_account = &mut ctx.accounts.player_stake_account;

        // If the player hasn't staked any tokens, return an error.
        if !player_stake_account.is_staked {
            return Err(ErrorCode::NotStaked.into());
        }

        // Calculate elapsed staking time.
        let current_time = Clock::get().unwrap().unix_timestamp;
        let time_staked = current_time - player_stake_account.timestamp;

        // Calculate reward amount.
        let amount = (time_staked as u64)
            .checked_mul(10u64.pow(ctx.accounts.mint.decimals as u32))
            .unwrap();

        // Vault token account PDA signer
        let bump = *ctx.bumps.get("vault_token_account").unwrap();
        let signer: &[&[&[u8]]] = &[&[VAULT_SEED, &[bump]]];

        // Transfer rewards to player's token account from vault token account.
        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault_token_account.to_account_info(),
                    to: ctx.accounts.player_token_account.to_account_info(),
                    authority: ctx.accounts.vault_token_account.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;

        // Player stake token account PDA signer
        let player = ctx.accounts.player.key();
        let bump = *ctx.bumps.get("player_stake_token_account").unwrap();
        let signer: &[&[&[u8]]] = &[&[TOKEN_SEED, player.as_ref(), &[bump]]];

        // Transfer staked tokens from player's stake token account to player's token account.
        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.player_stake_token_account.to_account_info(),
                    to: ctx.accounts.player_token_account.to_account_info(),
                    authority: ctx.accounts.player_stake_token_account.to_account_info(),
                },
                signer,
            ),
            ctx.accounts.player_stake_token_account.amount, // Transfer all tokens from the player's stake token account.
        )?;

        // Update the player_stake_account status and timestamp.
        player_stake_account.is_staked = false;
        player_stake_account.timestamp = Clock::get().unwrap().unix_timestamp;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    // The vault token account that will hold the tokens rewarded to the player for staking.
    // The same PDA is used as both the address of the token account and the "owner" of token account.
    #[account(
        init_if_needed,
        seeds = [VAULT_SEED],
        bump,
        payer = signer,
        token::mint = mint,
        token::authority = vault_token_account,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Airdrop<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        init_if_needed,
        payer = player,
        associated_token::mint = mint,
        associated_token::authority = player
    )]
    pub player_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    // The player's stake account, storing the player's staking status and timestamp.
    #[account(
        init_if_needed,
        seeds = [STAKE_STATE_SEED, player.key.as_ref()],
        bump,
        payer = player,
        space = 8 + std::mem::size_of::<StakeState>()
    )]
    pub player_stake_account: Account<'info, StakeState>,

    // The player's stake token account, storing the tokens staked by the player.
    // The same PDA is used as both the address of the token account and the "owner" of token account.
    // Tokens are transferred from the player's token account to this account.
    #[account(
        init_if_needed,
        seeds = [TOKEN_SEED, player.key.as_ref()],
        bump,
        payer = player,
        token::mint = mint,
        token::authority = player_stake_token_account,
    )]
    pub player_stake_token_account: Account<'info, TokenAccount>,

    // The player's associated token account for the token they are staking.
    // Tokens are transferred from this account to the player's stake token account.
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = player
    )]
    pub player_token_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    // The player's stake account, storing the player's staking status and timestamp.
    #[account(
        mut,
        seeds = [STAKE_STATE_SEED, player.key.as_ref()],
        bump,
    )]
    pub player_stake_account: Account<'info, StakeState>,

    // The player's stake token account, storing the tokens staked by the player.
    // Tokens transferred from this account back to the player's token account.
    #[account(
        mut,
        seeds = [TOKEN_SEED, player.key.as_ref()],
        bump,
    )]
    pub player_stake_token_account: Account<'info, TokenAccount>,

    // The player's associated token account for the token they are staking.
    // Tokens transferred into this account from the vault token account and stake token account.
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = player
    )]
    pub player_token_account: Account<'info, TokenAccount>,

    // The vault token account that will hold the tokens rewarded to the player for staking.
    // Tokens transferred from this account to the player's token account.
    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

// At minimum, keep track of staking status and timestamp.
// This can be expanded to include more information
#[account]
pub struct StakeState {
    pub is_staked: bool,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Tokens Already Staked")]
    IsStaked,
    #[msg("Tokens Not Staked Yet")]
    NotStaked,
}
