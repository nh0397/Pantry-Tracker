import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function POST(req) {
  try {
    const { id, name, quantity, maxQuantity, variant, measure, unit } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400 });
    }

    const itemRef = doc(db, 'inventory', id);
    await updateDoc(itemRef, {
      name,
      quantity,
      maxQuantity,
      variant,
      measure,
      unit,
    });

    return new Response(JSON.stringify({ message: 'Item updated successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error updating item:', error);
    return new Response(JSON.stringify({ error: 'Failed to update item' }), { status: 500 });
  }
}
