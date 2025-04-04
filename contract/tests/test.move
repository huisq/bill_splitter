#[test_only]
module admin::test {
    use std::signer::address_of;
    use aptos_std::debug;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use admin::global_state as gs;
    use admin::aptme;

    #[test(deployer = @admin, user= @0xb)]
    fun test_view(
        deployer: &signer,
        user: &signer
    ){
        timestamp::set_time_has_started_for_testing(&account::create_account_for_test(@0x1));
        gs::init_for_test(deployer);
        aptme::create_bill(
            user,
            vector[address_of(deployer), address_of(user)],
            100
        );
        aptme::create_bill(
            deployer,
            vector[address_of(deployer), address_of(user)],
            50
        );
        debug::print(&gs::view_all_bills());
    }
}