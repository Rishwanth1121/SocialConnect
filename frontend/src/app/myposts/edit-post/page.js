"use client";
import { useParams } from 'next/navigation';

export default function EditPostPage() {
  const { id } = useParams();

  return (
    <div>
      <h2>Edit Post {id}</h2>
      {/* Add edit form here */}
    </div>
  );
}
