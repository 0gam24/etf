import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/posts';

export async function GET() {
  const posts = getAllPosts().slice(0, 100);
  const items = posts.map(p => ({
    title: p.meta.title,
    category: p.meta.category,
    categoryName: p.categoryName,
    slug: p.meta.slug,
    description: p.meta.description,
  }));
  return NextResponse.json({ items });
}
