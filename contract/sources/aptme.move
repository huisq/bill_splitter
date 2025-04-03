module admin::aptme {
    use std::bcs;
    use std::vector;
    use std::signer::address_of;
    use aptos_std::table_with_length as table;
    use aptos_framework::object::{Self};
    use admin::global_state::{Self as gs, config_signer, config_address};

    //==============================================================================================
    // Error codes
    //==============================================================================================
    const EPROFILE_ALREADY_EXISTS: u64 = 0;
    const EINVALID_PAYEE_INFO: u64 = 1;

    //==============================================================================================
    // Structs
    //==============================================================================================
    struct Profile has key {
        user: address,
        bill_proposed: vector<u64>, //uid
        bill_received: vector<u64> //uid
    }


    public entry fun create_bill(
        user: &signer,
        payee_address: vector<address>,
        payee_amount: vector<u64>,
    ) acquires Profile {
        if(!profile_exist_check(address_of(user))){
            create_profile(address_of(user))
        };
        assert!(payee_address.length() == payee_amount.length(), EINVALID_PAYEE_INFO);
        let payees = table::new<address, u64>();
        for(i in 0..payee_address.length()){
            payees.add(payee_address[i], payee_amount[i]);
            i += 1
        };
        let bill_no = gs::create_bill(address_of(user), payees);
        let proposer = user_profile_mut(address_of(user));
        proposer.bill_proposed.push_back(bill_no);

        for(i in 0..payee_address.length()){
            let payee = payee_address[i];
            if(!profile_exist_check(payee)){
                create_profile(payee);
            };
            let payee_profile = user_profile_mut(payee);
            payee_profile.bill_received.push_back(bill_no);
            i += 1;
        };
    }

    public entry fun pay_bill(
        user: &signer,
        uid: u64,
        amount: u64
    ){
        gs::pay_bill(user, uid, amount)
    }

    public entry fun create_profile(
        user: address
    ){
        assert!(!profile_exist_check(user), EPROFILE_ALREADY_EXISTS);
        let constr = &object::create_named_object(
            &config_signer(),
            bcs::to_bytes(&user));
        let user_obj_signer = &object::generate_signer(constr);
        object::transfer_with_ref(
            object::generate_linear_transfer_ref(&object::generate_transfer_ref(constr)),
            user);
        move_to(user_obj_signer, Profile{
            user,
            bill_proposed: vector::empty(),
            bill_received: vector::empty(),
        })
    }

    inline fun user_profile(user: address): &Profile { borrow_global(user_obj_add(user)) }

    inline fun user_profile_mut(user: address): &mut Profile { borrow_global_mut(user_obj_add(user)) }


    fun user_obj_add(user: address): address {
        object::create_object_address(&config_address(), bcs::to_bytes(&user))
    }

    fun profile_exist_check(user: address): bool {
        exists<Profile>(user_obj_add(user))
    }
}
