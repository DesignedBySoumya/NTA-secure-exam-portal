-- Ensure payments table has all required columns for the new update logic
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='transaction_id') THEN
        ALTER TABLE public.payments ADD COLUMN transaction_id text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='payment_method') THEN
        ALTER TABLE public.payments ADD COLUMN payment_method text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='payment_date') THEN
        ALTER TABLE public.payments ADD COLUMN payment_date timestamp with time zone;
    END IF;
END $$;
