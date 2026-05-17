-- Function to automatically allocate exam centers based on student city preferences
-- It checks preferences in order (1, 2, 3) and allocates the first available center
-- with remaining capacity, then decrements the center capacity to prevent overbooking.

CREATE OR REPLACE FUNCTION auto_allocate_exam_centers()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    app RECORD;
    center RECORD;
    allocated boolean;
BEGIN
    -- Iterate over applications that are approved and don't have a center assigned
    FOR app IN 
        SELECT id, city_pref_1, city_pref_2, city_pref_3 
        FROM public.applications 
        WHERE status = 'approved' AND center_id IS NULL
        ORDER BY created_at ASC
    LOOP
        allocated := false;

        -- Check Preference 1
        IF app.city_pref_1 IS NOT NULL AND allocated = false THEN
            SELECT * INTO center FROM public.exam_centers 
            WHERE city = app.city_pref_1 AND capacity > 0 LIMIT 1 FOR UPDATE;

            IF FOUND THEN
                UPDATE public.applications SET center_id = center.id WHERE id = app.id;
                UPDATE public.exam_centers SET capacity = capacity - 1 WHERE id = center.id;
                allocated := true;
            END IF;
        END IF;

        -- Check Preference 2
        IF app.city_pref_2 IS NOT NULL AND allocated = false THEN
            SELECT * INTO center FROM public.exam_centers 
            WHERE city = app.city_pref_2 AND capacity > 0 LIMIT 1 FOR UPDATE;

            IF FOUND THEN
                UPDATE public.applications SET center_id = center.id WHERE id = app.id;
                UPDATE public.exam_centers SET capacity = capacity - 1 WHERE id = center.id;
                allocated := true;
            END IF;
        END IF;

        -- Check Preference 3
        IF app.city_pref_3 IS NOT NULL AND allocated = false THEN
            SELECT * INTO center FROM public.exam_centers 
            WHERE city = app.city_pref_3 AND capacity > 0 LIMIT 1 FOR UPDATE;

            IF FOUND THEN
                UPDATE public.applications SET center_id = center.id WHERE id = app.id;
                UPDATE public.exam_centers SET capacity = capacity - 1 WHERE id = center.id;
                allocated := true;
            END IF;
        END IF;
    END LOOP;
END;
$$;
