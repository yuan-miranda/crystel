// api/load_board.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const result = await supabase
        .from("board")
        .select("*")
        .order("created_at", { ascending: true });

    if (result.error) {
        return res.status(500).json({ error: result.error.message });
    }

    return res.status(200).json(result.data);
}