// api/save_board.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PASSWORD = process.env.BOARD_PASSWORD;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { id, text, left, top, inputPassword } = req.body;

    if (inputPassword !== PASSWORD) {
        return res.status(403).json({ error: '403 Forbidden' });
    }

    if (text === undefined || left === undefined || top === undefined) {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    let result;

    if (id) {
        result = await supabase
            .from('board')
            .update({
                text,
                left_pos: left,
                top_pos: top,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select();
    } else {
        result = await supabase
            .from('board')
            .insert({
                text,
                left_pos: left,
                top_pos: top,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .select();
    }

    if (result.error) {
        return res.status(500).json({ error: result.error.message });
    }

    return res.status(200).json({ data: result.data });
}