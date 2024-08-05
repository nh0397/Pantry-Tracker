import { NextResponse } from 'next/server';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request) {
  const data = await request.json();

  try {
    const docRef = await addDoc(collection(db, 'inventory'), data);
    return NextResponse.json({ id: docRef.id });
  } catch (error) {
    console.error("Error adding document: ", error);
    return NextResponse.json({ error: 'Error adding item' }, { status: 500 });
  }
}
