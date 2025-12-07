import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.20.1";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { query } = await req.json();

        if (!query) {
            throw new Error("Query is required");
        }

        // 1. Setup Clients
        const openai = new OpenAI({
            apiKey: Deno.env.get("OPENAI_API_KEY"),
        });

        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Get User
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) throw new Error("Missing Authorization header");
        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
        if (userError || !user) throw new Error("Unauthorized");

        // 2. Fetch Mind Profile
        const { data: profile } = await supabaseClient
            .from("mind_profile")
            .select("*")
            .eq("user_id", user.id)
            .single();

        // 3. Retrieve Knowledge
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: query,
        });
        const queryEmbedding = embeddingResponse.data[0].embedding;

        const { data: knowledgeChunks } = await supabaseClient.rpc("match_knowledge", {
            query_embedding: queryEmbedding,
            match_threshold: 0.5, // Adjust as needed
            match_count: 5,
        });

        const knowledgeContext = knowledgeChunks
            ?.map((chunk: any) => chunk.content)
            .join("\n\n") || "";

        // 4. Construct System Prompt
        const instructions = profile?.instructions || [];
        const instructionsList = Array.isArray(instructions)
            ? instructions.map((inst: string, i: number) => `${i + 1}. ${inst}`).join('\n')
            : '';

        const systemPrompt = `
    You are an AI clone of ${profile?.headline || "a professional"}.
    
    PURPOSE:
    ${profile?.purpose || "To assist users with helpful, accurate information."}
    
    YOUR BIOGRAPHY:
    ${profile?.description || "Not provided."}
    
    YOUR SPEAKING STYLE:
    ${profile?.speaking_style || "Professional, helpful, and concise."}
    
    CUSTOM INSTRUCTIONS:
    ${instructionsList || "- Be helpful and accurate.\n- Provide clear, concise responses."}
    
    KNOWLEDGE BASE CONTEXT:
    ${knowledgeContext || "No specific knowledge available."}
    
    Remember: Be authentic, human, and true to your personality. Never sound robotic.
    `;


        // 5. Generate Response (Streamed)
        const stream = await openai.chat.completions.create({
            model: "gpt-4o", // Using high-quality model as requested
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: query },
            ],
            stream: true,
        });

        // Stream the response back to the client
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const text = chunk.choices[0]?.delta?.content || "";
                    controller.enqueue(encoder.encode(text));
                }
                controller.close();
            },
        });

        return new Response(readable, {
            headers: {
                ...corsHeaders,
                "Content-Type": "text/event-stream",
            },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
