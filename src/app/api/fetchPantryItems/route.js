import { NextResponse } from 'next/server';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, 'inventory'));
    const items = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching documents: ", error);
    return NextResponse.json({ error: 'Error fetching items' }, { status: 500 });
  }
}
