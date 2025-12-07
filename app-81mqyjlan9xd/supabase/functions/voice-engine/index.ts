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
        const formData = await req.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            throw new Error("Audio file is required");
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

        // 2. Speech to Text (STT)
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-1",
        });
        const query = transcription.text;
        console.log("Transcribed query:", query);

        // 3. Chat Logic (Simplified duplication from chat-engine)
        // Fetch Mind Profile
        const { data: profile } = await supabaseClient
            .from("mind_profile")
            .select("*")
            .eq("user_id", user.id)
            .single();

        // Retrieve Knowledge
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: query,
        });
        const queryEmbedding = embeddingResponse.data[0].embedding;

        const { data: knowledgeChunks } = await supabaseClient.rpc("match_knowledge", {
            query_embedding: queryEmbedding,
            match_threshold: 0.5,
            match_count: 3,
        });

        const knowledgeContext = knowledgeChunks
            ?.map((chunk: any) => chunk.content)
            .join("\n\n") || "";

        const systemPrompt = `
    You are an AI clone of ${profile?.headline || "a professional"}.
    Your Biography: ${profile?.description || "Not provided."}
    Your Speaking Style: ${profile?.speaking_style || "Professional, helpful, and concise."}
    
    Instructions:
    - Answer the user's question based on your personality and the provided knowledge.
    - Keep your answer concise as it will be spoken out loud.
    - Do NOT sound robotic. Be human, engaging, and authentic.
    
    Knowledge Base Context:
    ${knowledgeContext}
    `;

        // Generate Text Response
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: query },
            ],
        });
        const textResponse = completion.choices[0].message.content || "I'm sorry, I couldn't generate a response.";

        // 4. Text to Speech (TTS)
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy", // You can make this dynamic based on profile settings
            input: textResponse,
        });

        const buffer = new Uint8Array(await mp3.arrayBuffer());

        // Return Audio
        return new Response(buffer, {
            headers: {
                ...corsHeaders,
                "Content-Type": "audio/mpeg",
                "X-Transcribed-Text": query, // Send back what was heard
                "X-Response-Text": textResponse, // Send back what was said
            },
        });

    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
