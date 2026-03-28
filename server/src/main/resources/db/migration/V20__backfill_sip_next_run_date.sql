-- Backfill next_run_date and is_active for SIPOrders that were confirmed
-- (i.e. have at least one ACTIVE order item) but were created before this
-- field was initialized. Never-confirmed SIPs (no ACTIVE items) are left
-- untouched so the scheduler does not pick them up.
UPDATE orders o
SET next_run_date = start_date,
    is_active     = true
WHERE dtype = 'SIP'
  AND next_run_date IS NULL
  AND EXISTS (
      SELECT 1
      FROM order_items oi
      WHERE oi.order_id = o.id
        AND oi.status = 'ACTIVE'
  );
