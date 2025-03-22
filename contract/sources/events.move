module bill_splitter::events {
    use std::string::String;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::object::{Self, Object, ConstructorRef};
    use aptos_framework::account;
    use aptos_framework::signer;
    use aptos_framework::system_addresses;

    friend bill_splitter::bill_splitter;

    // Event storage wrapper
    struct EventStorage has key {
        id: ConstructorRef,
        events: BillEvents
    }

    // Event structures
    struct BillEvents has store {
        bill_created_events: EventHandle<BillCreatedEvent>,
        bill_payment_events: EventHandle<BillPaymentEvent>,
        bill_closed_events: EventHandle<BillClosedEvent>,
        bill_expired_events: EventHandle<BillExpiredEvent>,
    }

    struct BillCreatedEvent has drop, store {
        bill_id: u64,
        creator: address,
        title: String,
        total_amount: u64,
        token: address,
        participant_count: u64,
        deadline: u64,
    }

    struct BillPaymentEvent has drop, store {
        bill_id: u64,
        payer: address,
        amount: u64,
        token: address,
        remaining: u64,
        is_completed: bool,
    }

    struct BillClosedEvent has drop, store {
        bill_id: u64,
        creator: address,
        status: u8,
    }

    struct BillExpiredEvent has drop, store {
        bill_id: u64,
        creator: address,
    }

    // Initialize events
    public(friend) fun initialize_events(account: &signer) {
        system_addresses::assert_aptos_framework(account);
        let constructor_ref = object::create_named_object(account, b"EventStorage");
        let events = BillEvents {
            bill_created_events: account::new_event_handle(account),
            bill_payment_events: account::new_event_handle(account),
            bill_closed_events: account::new_event_handle(account),
            bill_expired_events: account::new_event_handle(account),
        };
        let storage = EventStorage {
            id: constructor_ref,
            events
        };
        let storage_signer = object::generate_signer(&constructor_ref);
        move_to(&storage_signer, storage);
    }

    public(friend) fun borrow_events(): &BillEvents acquires EventStorage {
        let store_addr = object::create_object_address(&@bill_splitter, b"EventStorage");
        &borrow_global<EventStorage>(store_addr).events
    }

    public(friend) fun borrow_events_mut(): &mut BillEvents acquires EventStorage {
        let store_addr = object::create_object_address(&@bill_splitter, b"EventStorage");
        &mut borrow_global_mut<EventStorage>(store_addr).events
    }

    // Event emission functions
    public(friend) fun emit_bill_created(
        events: &mut BillEvents,
        bill_id: u64,
        creator: address,
        title: String,
        total_amount: u64,
        token: address,
        participant_count: u64,
        deadline: u64,
    ) {
        event::emit_event(
            &mut events.bill_created_events,
            BillCreatedEvent {
                bill_id,
                creator,
                title,
                total_amount,
                token,
                participant_count,
                deadline,
            }
        );
    }

    public(friend) fun emit_bill_payment(
        events: &mut BillEvents,
        bill_id: u64,
        payer: address,
        amount: u64,
        token: address,
        remaining: u64,
        is_completed: bool,
    ) {
        event::emit_event(
            &mut events.bill_payment_events,
            BillPaymentEvent {
                bill_id,
                payer,
                amount,
                token,
                remaining,
                is_completed,
            }
        );
    }

    public(friend) fun emit_bill_closed(
        events: &mut BillEvents,
        bill_id: u64,
        creator: address,
        status: u8,
    ) {
        event::emit_event(
            &mut events.bill_closed_events,
            BillClosedEvent {
                bill_id,
                creator,
                status,
            }
        );
    }

    public(friend) fun emit_bill_expired(
        events: &mut BillEvents,
        bill_id: u64,
        creator: address,
    ) {
        event::emit_event(
            &mut events.bill_expired_events,
            BillExpiredEvent {
                bill_id,
                creator,
            }
        );
    }
} 