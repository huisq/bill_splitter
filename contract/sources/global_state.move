module admin::global_state {

    //==============================================================================================
    // Dependencies
    //==============================================================================================
    use std::signer::address_of;
    use std::string::String;
    use aptos_framework::object::{Self, ExtendRef, Object, address_to_object};
    use std::vector;
    use aptos_std::string_utils;
    use aptos_framework::fungible_asset::Metadata;
    use aptos_framework::primary_fungible_store;
    use aptos_framework::timestamp;
    friend admin::aptme;

    //==============================================================================================
    // Constants
    //==============================================================================================
    const GLOBAL_STATE_NAME: vector<u8> = b"aptme";

    //==============================================================================================
    // Error codes
    //==============================================================================================
    const EPAYEE_NOT_EXISTS: u64 = 0;
    const USDT: address = @0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b;

    //==============================================================================================
    // Structs
    //==============================================================================================
    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct GlobalState has key {
        extend_ref: ExtendRef,
        bill: vector<Bill>,
    }

    struct Bill has store, copy, drop{
        proposer: address,
        payees: vector<address>,
        amount: u64,
        created: u64,
        completed_at: u64, //0 if not completed
    }


    //==============================================================================================
    // Init
    //==============================================================================================
    fun init_module(admin: &signer) {
        let global_state = &object::create_named_object(admin, GLOBAL_STATE_NAME);
        let global_state_signer = &object::generate_signer(global_state);
        move_to(global_state_signer, GlobalState {
            extend_ref: object::generate_extend_ref(global_state),
            bill: vector::empty()
        });
    }

    //==============================================================================================
    // Functions
    //==============================================================================================
    #[view]
    public fun global_state_object(): Object<GlobalState> {
        object::address_to_object(config_address())
    }

    #[view]
    public fun config_address(): address {
        object::create_object_address(&@admin, GLOBAL_STATE_NAME)
    }

    public(friend) fun config_signer(): signer acquires GlobalState {
        object::generate_signer_for_extending(&borrow_global<GlobalState>(config_address()).extend_ref)
    }

    #[view]
    public fun get_bill_no(): u64 acquires GlobalState {
        borrow_global<GlobalState>(config_address()).bill.length()
    }

    public(friend) fun create_bill(
        proposer: address,
        payees: vector<address>,
        amount: u64
    ): u64 acquires GlobalState {
        let state = borrow_global_mut<GlobalState>(config_address());
        state.bill.push_back(Bill{
            proposer,
            payees,
            amount,
            created: timestamp::now_seconds(),
            completed_at: 0
        });
        state.bill.length()-1
    }

    public(friend) fun pay_bill(
        payee: &signer,
        uid: u64,
    ) acquires GlobalState {
        assert_is_payee(uid, address_of(payee));
        let bill = borrow_global_mut<GlobalState>(config_address()).bill.borrow_mut(uid);
        if(bill.payees.contains(&address_of(payee))){
            let (_, i) = bill.payees.index_of(&address_of(payee));
            bill.payees.remove(i);
        }else{
            abort EPAYEE_NOT_EXISTS
        };
        primary_fungible_store::transfer(payee, address_to_object<Metadata>(USDT), bill.proposer, bill.amount);
        if(bill.payees.length() == 0){
            bill.completed_at = timestamp::now_seconds();
        };
    }

    //==============================================================================================
    // View Functions
    //==============================================================================================
    #[view]
    public fun view_all_bills(): vector<vector<String>> acquires GlobalState {
        let bill = borrow_global<GlobalState>(config_address()).bill;
        let output = vector::empty();
        for(i in 0..bill.length()){
            let entry = vector::empty<String>();
            entry.push_back(string_utils::to_string(&bill[i].proposer));
            let payees = bill[i].payees;
            let payee_string = string_utils::to_string(&payees[i]);
            for(j in 1..payees.length()){
                payee_string = string_utils::format2(&b"{},{}", payee_string, payees[i]);
            };
            entry.push_back(payee_string);
            entry.push_back(string_utils::to_string(&bill[i].amount));
            entry.push_back(string_utils::to_string(&bill[i].created));
            entry.push_back(string_utils::to_string(&bill[i].completed_at));
            output.push_back(entry);
        };
        output
    }

    //==============================================================================================
    // Helper Functions
    //==============================================================================================
    public fun assert_is_payee(bill_uid: u64, payee: address) acquires GlobalState {
        let state = borrow_global<GlobalState>(config_address());
        assert!(state.bill.borrow(bill_uid).payees.contains(&payee), EPAYEE_NOT_EXISTS);
    }

    #[test_only]
    public fun init_for_test(deployer: &signer) {
        init_module(deployer);
    }
}
