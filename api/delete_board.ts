// api/delete_board.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PASSWORD = process.env.BOARD_PASSWORD;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "DELETE") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { id, inputPassword } = req.body;

    if (inputPassword !== PASSWORD) {
        return res.status(403).json({ error: '403 Forbidden' });
    }

    const result = await supabase
        .from('board')
        .delete()
        .eq('id', id);

    if (result.error) {
        return res.status(500).json({ error: result.error.message });
    }

    return res.status(200).json({ data: result.data });
}