module bill_splitter::types {
    use std::string::String;
    use std::option::{Self, Option};
    use std::vector;
    use aptos_std::table::{Self, Table};
    use aptos_framework::account;
    use aptos_framework::object::{Self, Object, ConstructorRef};
    use aptos_framework::timestamp;

    friend bill_splitter::bill_splitter;

    // Bill status constants
    const BILL_STATUS_PENDING: u8 = 0;
    const BILL_STATUS_COMPLETED: u8 = 1;
    const BILL_STATUS_EXPIRED: u8 = 2;

    // Participant structure
    struct Participant has store, drop, copy {
        address: address,
        amount: u64,
        paid: bool,
        paid_amount: u64,
        paid_token: Option<address>,
        paid_at: Option<u64>,
    }

    // Bill structure
    struct Bill has key {
        id: ConstructorRef,
        bill_number: u64,
        creator: address,
        title: String,
        description: String,
        total_amount: u64,
        token: address,
        accepted_tokens: vector<address>,
        participants: vector<Participant>,
        deadline: u64,
        status: u8,
        created_at: u64,
    }

    // Bill store structure
    struct BillStore has key {
        id: ConstructorRef,
        bills: Table<u64, Object<Bill>>,
        user_bills: Table<address, vector<u64>>,
        next_bill_id: u64,
    }

    // Public access functions
    public fun get_bill_status_pending(): u8 { BILL_STATUS_PENDING }
    public fun get_bill_status_completed(): u8 { BILL_STATUS_COMPLETED }
    public fun get_bill_status_expired(): u8 { BILL_STATUS_EXPIRED }

    // Bill store functions
    public(friend) fun initialize_bill_store(account: &signer) {
        let constructor_ref = object::create_named_object(account, b"BillStore");
        let store = BillStore {
            id: constructor_ref,
            bills: table::new(),
            user_bills: table::new(),
            next_bill_id: 0,
        };
        let store_signer = object::generate_signer(&constructor_ref);
        move_to(&store_signer, store);
    }

    // Bill store access functions
    public(friend) fun borrow_bill_store(): &BillStore acquires BillStore {
        let store_addr = object::create_object_address(&@bill_splitter, b"BillStore");
        borrow_global<BillStore>(store_addr)
    }

    public(friend) fun borrow_bill_store_mut(): &mut BillStore acquires BillStore {
        let store_addr = object::create_object_address(&@bill_splitter, b"BillStore");
        borrow_global_mut<BillStore>(store_addr)
    }

    // Bill functions
    public(friend) fun create_bill(
        creator: &signer,
        bill_number: u64,
        title: String,
        description: String,
        total_amount: u64,
        token: address,
        accepted_tokens: vector<address>,
        participants: vector<Participant>,
        deadline: u64,
        created_at: u64,
    ): Object<Bill> {
        let constructor_ref = object::create_object(creator);
        let bill = Bill {
            id: constructor_ref,
            bill_number,
            creator: account::get_address(creator),
            title,
            description,
            total_amount,
            token,
            accepted_tokens,
            participants,
            deadline,
            status: BILL_STATUS_PENDING,
            created_at,
        };
        let bill_signer = object::generate_signer(&constructor_ref);
        move_to(&bill_signer, bill);
        object::object_from_constructor_ref(&constructor_ref)
    }

    // Bill store management functions
    public(friend) fun get_next_bill_id(store: &BillStore): u64 {
        store.next_bill_id
    }

    public(friend) fun increment_next_bill_id(store: &mut BillStore) {
        store.next_bill_id = store.next_bill_id + 1;
    }

    public(friend) fun add_bill_to_store(store: &mut BillStore, bill_obj: Object<Bill>) {
        let bill_id = store.next_bill_id;
        table::add(&mut store.bills, bill_id, bill_obj);
        increment_next_bill_id(store);
    }

    public(friend) fun get_bill_from_store(store: &BillStore, bill_id: u64): Object<Bill> {
        *table::borrow(&store.bills, bill_id)
    }

    public(friend) fun add_bill_to_user(store: &mut BillStore, user: address, bill_id: u64) {
        if (!table::contains(&store.user_bills, user)) {
            table::add(&mut store.user_bills, user, vector::empty<u64>());
        };
        let user_bills = table::borrow_mut(&mut store.user_bills, user);
        vector::push_back(user_bills, bill_id);
    }

    public(friend) fun get_user_bills(store: &BillStore, user: address): vector<u64> {
        if (!table::contains(&store.user_bills, user)) {
            return vector::empty()
        };
        *table::borrow(&store.user_bills, user)
    }

    // Participant operations
    public(friend) fun create_participant(addr: address, amount: u64): Participant {
        Participant {
            address: addr,
            amount,
            paid: false,
            paid_amount: 0,
            paid_token: option::none(),
            paid_at: option::none(),
        }
    }

    // Bill field accessors
    public(friend) fun get_bill_creator(bill: &Bill): address { bill.creator }
    public(friend) fun get_bill_status(bill: &Bill): u8 { bill.status }
    public(friend) fun get_bill_deadline(bill: &Bill): u64 { bill.deadline }
    public(friend) fun get_bill_accepted_tokens(bill: &Bill): &vector<address> { &bill.accepted_tokens }
    public(friend) fun get_bill_participants(bill: &Bill): &vector<Participant> { &bill.participants }
    public(friend) fun get_bill_participants_mut(bill: &mut Bill): &mut vector<Participant> { &mut bill.participants }

    // Bill field mutators
    public(friend) fun set_bill_status(bill: &mut Bill, status: u8) {
        bill.status = status;
    }

    // Participant field accessors
    public(friend) fun get_participant_address(participant: &Participant): address { participant.address }
    public(friend) fun get_participant_amount(participant: &Participant): u64 { participant.amount }
    public(friend) fun get_participant_paid_amount(participant: &Participant): u64 { participant.paid_amount }
    public(friend) fun get_participant_paid_status(participant: &Participant): bool { participant.paid }
    
    public(friend) fun set_participant_paid_amount(participant: &mut Participant, amount: u64) {
        participant.paid_amount = amount;
    }

    public(friend) fun set_participant_paid_status(participant: &mut Participant, paid: bool) {
        participant.paid = paid;
    }

    public(friend) fun set_participant_paid_token(participant: &mut Participant, token: address) {
        participant.paid_token = option::some(token);
    }

    public(friend) fun set_participant_paid_at(participant: &mut Participant, timestamp: u64) {
        participant.paid_at = option::some(timestamp);
    }
} 