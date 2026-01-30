CREATE OR REPLACE FUNCTION public.purchase_product_with_credits(p_product_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_price INTEGER;
    v_balance INTEGER;
    v_product_status TEXT;
BEGIN
    -- 1. Verificar si el usuario está logueado
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;

    -- 2. Obtener datos del producto y bloquear la fila para evitar cambios durante la compra
    SELECT price_credits, status INTO v_price, v_product_status
    FROM public.shop_products
    WHERE id = p_product_id AND deleted_at IS NULL
    FOR SHARE;

    IF v_product_status <> 'active' THEN
        RAISE EXCEPTION 'El producto no está disponible para la venta';
    END IF;

    -- 3. Obtener y bloquear la wallet del usuario para evitar "double-spending"
    SELECT balance_credits INTO v_balance
    FROM public.wallets
    WHERE user_id = v_user_id
    FOR UPDATE;

    -- 4. Validar saldo
    IF v_balance < v_price THEN
        RAISE EXCEPTION 'Saldo insuficiente (Créditos actuales: %)', v_balance;
    END IF;

    -- 5. Ejecutar la transacción
    -- A: Restar créditos
    UPDATE public.wallets 
    SET balance_credits = balance_credits - v_price,
        updated_at = NOW(),
        updated_by = v_user_id
    WHERE user_id = v_user_id;

    -- B: Crear el registro de compra
    INSERT INTO public.purchases (
        user_id, 
        product_id, 
        amount_paid, 
        status, 
        created_by, 
        updated_by
    ) VALUES (
        v_user_id, 
        p_product_id, 
        v_price, 
        'completed', 
        v_user_id, 
        v_user_id
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Compra realizada con éxito',
        'new_balance', v_balance - v_price
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'message', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;