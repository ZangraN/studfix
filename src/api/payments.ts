import { db } from '../db';
import { Payment } from '../types';

// GET /api/payments
export async function getPayments() {
  try {
    const payments = await db.payments.toArray();
    return new Response(JSON.stringify(payments), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error getting payments:', error);
    return new Response(JSON.stringify({ error: 'Failed to get payments' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// POST /api/payments
export async function addPayment(request: Request) {
  try {
    const payment: Payment = await request.json();
    const id = await db.payments.add(payment);
    return new Response(JSON.stringify({ id }), {
      headers: { 'Content-Type': 'application/json' },
      status: 201
    });
  } catch (error) {
    console.error('Error adding payment:', error);
    return new Response(JSON.stringify({ error: 'Failed to add payment' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// PUT /api/payments/:id
export async function updatePayment(request: Request, id: number) {
  try {
    const payment: Payment = await request.json();
    await db.payments.update(id, payment);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    return new Response(JSON.stringify({ error: 'Failed to update payment' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// DELETE /api/payments/:id
export async function deletePayment(id: number) {
  try {
    await db.payments.delete(id);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete payment' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
} 