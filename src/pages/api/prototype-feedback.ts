import type { APIRoute } from 'astro';
import { z } from 'zod';
import { mkdir, appendFile, readFile } from 'fs/promises';
import { join } from 'path';

export const prerender = false;

const FEEDBACK_DIR = join(process.cwd(), '.prototype-feedback');
const FEEDBACK_FILE = join(FEEDBACK_DIR, 'comments.jsonl');

const feedbackSchema = z.object({
  page: z.string().max(500),
  selector: z.string().max(2000),
  elementText: z.string().max(300).optional(),
  elementTag: z.string().max(50).optional(),
  rect: z
    .object({
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number(),
    })
    .optional(),
  viewport: z
    .object({
      w: z.number(),
      h: z.number(),
      device: z.enum(['mobile', 'desktop']),
      pointer: z.enum(['coarse', 'fine']).optional(),
    })
    .optional(),
  comment: z.string().min(1).max(4000),
});

export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.ANNOTATION_SYSTEM !== 'true' && import.meta.env.PUBLIC_ANNOTATION_SYSTEM !== 'true') {
    return new Response(JSON.stringify({ error: 'Annotation system disabled' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Validation error', details: z.flattenError(parsed.error) }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
    await mkdir(FEEDBACK_DIR, { recursive: true });
    const line =
      JSON.stringify({ ts: new Date().toISOString(), ...parsed.data }) + '\n';
    await appendFile(FEEDBACK_FILE, line, 'utf8');
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('prototype-feedback POST error:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const GET: APIRoute = async ({ url }) => {
  if (import.meta.env.ANNOTATION_SYSTEM !== 'true' && import.meta.env.PUBLIC_ANNOTATION_SYSTEM !== 'true') {
    return new Response('[]', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    const text = await readFile(FEEDBACK_FILE, 'utf8').catch(() => '');
    const items = text
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    const pageFilter = url.searchParams.get('page');
    const filtered = pageFilter ? items.filter((i: { page: string }) => i.page === pageFilter) : items;
    return new Response(JSON.stringify(filtered), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('prototype-feedback GET error:', error);
    return new Response('[]', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
