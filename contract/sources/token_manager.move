module bill_splitter::token_manager {
    use std::error;
    use std::vector;
    use std::signer;
    use aptos_framework::coin;
    use aptos_std::type_info;

    friend bill_splitter::bill_splitter;

    // Error codes
    const E_INVALID_TOKEN: u64 = 1;
    const E_INSUFFICIENT_BALANCE: u64 = 2;

    // Verify if token is in accepted list
    public fun verify_token<CoinType>(accepted_tokens: &vector<address>): bool {
        let token_type_info = type_info::type_of<CoinType>();
        let token_address = type_info::account_address(&token_type_info);
        
        let i = 0;
        let len = vector::length(accepted_tokens);
        
        while (i < len) {
            if (*vector::borrow(accepted_tokens, i) == token_address) {
                return true
            };
            i = i + 1;
        };
        false
    }

    // Transfer tokens
    public(friend) fun transfer_token<CoinType>(
        from: &signer,
        to: address,
        amount: u64,
    ) {
        let from_addr = signer::address_of(from);
        assert!(coin::balance<CoinType>(from_addr) >= amount, error::invalid_argument(E_INSUFFICIENT_BALANCE));
        coin::transfer<CoinType>(from, to, amount);
    }

    // Get token info
    public fun get_token_info<CoinType>(): type_info::TypeInfo {
        type_info::type_of<CoinType>()
    }

    // Check balance
    public fun check_balance<CoinType>(account_addr: address): u64 {
        coin::balance<CoinType>(account_addr)
    }
} 