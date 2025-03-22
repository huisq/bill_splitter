module bill_splitter::bill_splitter {
    use std::error;
    use std::string::{Self, String};
    use std::vector;
    use std::option;
    use std::signer;
    use aptos_framework::timestamp;
    use aptos_framework::object::{Self, Object};
    use aptos_std::table;
    use aptos_std::type_info;
    use aptos_framework::system_addresses;
    
    use bill_splitter::types::{Self, Bill, BillStore, Participant};
    use bill_splitter::events::{Self, BillEvents};
    use bill_splitter::token_manager;

    // Error codes
    const E_INVALID_PARTICIPANT_DATA: u64 = 1;
    const E_BILL_NOT_FOUND: u64 = 2;
    const E_NOT_BILL_CREATOR: u64 = 3;
    const E_NOT_BILL_PARTICIPANT: u64 = 4;
    const E_BILL_EXPIRED: u64 = 5;
    const E_BILL_ALREADY_COMPLETED: u64 = 6;
    const E_INVALID_PAYMENT_AMOUNT: u64 = 7;
    const E_INVALID_TOKEN: u64 = 8;
    const E_INSUFFICIENT_PAYMENT: u64 = 9;

    // Initialize module
    fun init_module(account: &signer) {
        system_addresses::assert_aptos_framework(account);
        types::initialize_bill_store(account);
        events::initialize_events(account);
    }

    // Create bill
    public entry fun create_bill(
        creator: &signer,
        title: vector<u8>,
        description: vector<u8>,
        total_amount: u64,
        token: address,
        accepted_tokens: vector<address>,
        participant_addresses: vector<address>,
        participant_amounts: vector<u64>,
        deadline: u64,
    ) acquires BillStore {
        // Validate parameters
        let participant_count = vector::length(&participant_addresses);
        assert!(
            participant_count > 0 && participant_count == vector::length(&participant_amounts),
            error::invalid_argument(E_INVALID_PARTICIPANT_DATA)
        );

        // Create participant list
        let participants = vector::empty<Participant>();
        let i = 0;
        while (i < participant_count) {
            vector::push_back(&mut participants, types::create_participant(
                *vector::borrow(&participant_addresses, i),
                *vector::borrow(&participant_amounts, i)
            ));
            i = i + 1;
        };

        let bill_store = types::borrow_bill_store_mut();
        let creator_addr = signer::address_of(creator);
        let current_time = timestamp::now_seconds();
        
        let bill = types::create_bill(
            creator,
            types::get_next_bill_id(bill_store),
            string::utf8(title),
            string::utf8(description),
            total_amount,
            token,
            accepted_tokens,
            participants,
            deadline,
            current_time,
        );

        types::add_bill_to_store(bill_store, bill);
        types::add_bill_to_user(bill_store, creator_addr, types::get_next_bill_id(bill_store));

        let events = events::borrow_events_mut();
        events::emit_bill_created(
            events,
            types::get_next_bill_id(bill_store),
            creator_addr,
            string::utf8(title),
            total_amount,
            token,
            participant_count,
            deadline,
        );
    }

    // Pay bill
    public entry fun pay_bill<CoinType>(
        payer: &signer,
        bill_id: u64,
        amount: u64,
    ) acquires BillStore {
        let bill_store = types::borrow_bill_store();
        let bill_obj = types::get_bill_from_store(bill_store, bill_id);
        let bill = object::borrow(&bill_obj);
        
        // Validate status and deadline
        assert!(types::get_bill_status(bill) == types::get_bill_status_pending(), 
            error::invalid_state(E_BILL_ALREADY_COMPLETED));
        assert!(timestamp::now_seconds() <= types::get_bill_deadline(bill), 
            error::invalid_state(E_BILL_EXPIRED));
        
        // Validate token
        assert!(token_manager::verify_token<CoinType>(types::get_bill_accepted_tokens(bill)), 
            error::invalid_argument(E_INVALID_TOKEN));
        
        // Execute payment
        let bill_mut = object::borrow_mut(&bill_obj);
        let payer_addr = signer::address_of(payer);
        let required_amount = get_required_payment_amount(bill_mut, payer_addr);
        assert!(amount >= required_amount, error::invalid_argument(E_INSUFFICIENT_PAYMENT));
        
        token_manager::transfer_token<CoinType>(payer, types::get_bill_creator(bill_mut), amount);
        
        // Update payment status
        update_payment_status(bill_mut, payer_addr, amount);
        
        // Check if bill is completed and update status
        if (is_bill_completed(bill_mut)) {
            types::set_bill_status(bill_mut, types::get_bill_status_completed());
        };
        
        // Emit event
        let token_type_info = type_info::type_of<CoinType>();
        let token_address = type_info::account_address(&token_type_info);
        
        let events = events::borrow_events_mut();
        events::emit_bill_payment(
            events,
            bill_id,
            payer_addr,
            amount,
            token_address,
            get_remaining_amount(bill_mut, payer_addr),
            is_bill_completed(bill_mut),
        );
    }

    // Close bill
    public entry fun close_bill(
        creator: &signer,
        bill_id: u64,
    ) acquires BillStore {
        let bill_store = types::borrow_bill_store();
        let bill_obj = types::get_bill_from_store(bill_store, bill_id);
        let bill = object::borrow_mut(&bill_obj);
        
        assert!(signer::address_of(creator) == types::get_bill_creator(bill),
            error::permission_denied(E_NOT_BILL_CREATOR));
            
        let current_status = types::get_bill_status(bill);
        assert!(current_status == types::get_bill_status_pending(),
            error::invalid_state(E_BILL_ALREADY_COMPLETED));
            
        types::set_bill_status(bill, types::get_bill_status_completed());
        
        let events = events::borrow_events_mut();
        events::emit_bill_closed(
            events,
            bill_id,
            types::get_bill_creator(bill),
            types::get_bill_status_completed(),
        );
    }

    // Check expired bills
    public entry fun check_expired_bills(
        _account: &signer,
        bill_id: u64,
    ) acquires BillStore {
        let bill_store = types::borrow_bill_store();
        let bill_obj = types::get_bill_from_store(bill_store, bill_id);
        let bill = object::borrow_mut(&bill_obj);
        
        if (types::get_bill_status(bill) == types::get_bill_status_pending() &&
            timestamp::now_seconds() > types::get_bill_deadline(bill)) {
            types::set_bill_status(bill, types::get_bill_status_expired());
            
            let events = events::borrow_events_mut();
            events::emit_bill_expired(
                events,
                bill_id,
                types::get_bill_creator(bill),
            );
        };
    }

    // Query functions
    public fun get_bill_details(
        bill_id: u64
    ): (address, String, String, u64, address, vector<address>, vector<Participant>, u64, u8, u64) acquires BillStore {
        let bill_store = types::borrow_bill_store();
        let bill_obj = types::get_bill_from_store(bill_store, bill_id);
        let bill = object::borrow(&bill_obj);
        
        (
            types::get_bill_creator(bill),
            bill.title,
            bill.description,
            bill.total_amount,
            bill.token,
            *types::get_bill_accepted_tokens(bill),
            *types::get_bill_participants(bill),
            types::get_bill_deadline(bill),
            types::get_bill_status(bill),
            bill.created_at,
        )
    }

    public fun get_user_bills(user: address): vector<u64> acquires BillStore {
        let bill_store = types::borrow_bill_store();
        types::get_user_bills(bill_store, user)
    }

    // Helper functions
    fun update_payment_status(bill: &mut Bill, payer: address, amount: u64) {
        let participants = types::get_bill_participants_mut(bill);
        let i = 0;
        let len = vector::length(participants);
        while (i < len) {
            let participant = vector::borrow_mut(participants, i);
            if (types::get_participant_address(participant) == payer) {
                let current_paid = types::get_participant_paid_amount(participant);
                types::set_participant_paid_amount(participant, current_paid + amount);
                if (types::get_participant_paid_amount(participant) >= types::get_participant_amount(participant)) {
                    types::set_participant_paid_status(participant, true);
                    types::set_participant_paid_at(participant, timestamp::now_seconds());
                };
                break
            };
            i = i + 1;
        };
    }

    fun is_bill_completed(bill: &Bill): bool {
        let participants = types::get_bill_participants(bill);
        let i = 0;
        let len = vector::length(participants);
        while (i < len) {
            let participant = vector::borrow(participants, i);
            if (!types::get_participant_paid_status(participant)) {
                return false
            };
            i = i + 1;
        };
        true
    }

    fun get_remaining_amount(bill: &Bill, payer: address): u64 {
        let participants = types::get_bill_participants(bill);
        let i = 0;
        let len = vector::length(participants);
        while (i < len) {
            let participant = vector::borrow(participants, i);
            if (types::get_participant_address(participant) == payer) {
                return types::get_participant_amount(participant) - types::get_participant_paid_amount(participant)
            };
            i = i + 1;
        };
        0
    }

    fun get_required_payment_amount(bill: &Bill, payer: address): u64 {
        let participants = types::get_bill_participants(bill);
        let i = 0;
        let len = vector::length(participants);
        while (i < len) {
            let participant = vector::borrow(participants, i);
            if (types::get_participant_address(participant) == payer) {
                return types::get_participant_amount(participant)
            };
            i = i + 1;
        };
        0
    }
} 