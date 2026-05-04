alter table studio_settings
  add column if not exists payment_mode text
    default 'whatsapp'
    check (payment_mode in ('whatsapp', 'razorpay', 'both'));
