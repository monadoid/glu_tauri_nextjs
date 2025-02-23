"use client"
export interface ToolCall {
    id: string;
    tool_name: string;
    arguments: Record<string, unknown>;
}

export type ToolHit = Record<string, unknown>;

export interface Message {
    content: string;
    role: string;
}

export interface ExtendedToolCall {
    id: string;
    type: string;
    function: {
        name: string;
        arguments: string; // stringified JSON
    };
}

export interface ExtendedMessage {
    content: string | null;
    refusal: string | null;
    role: string;
    audio: string | null;
    function_call: unknown;
    tool_calls?: ExtendedToolCall[];
}

export type LLMToolCallMessage = Message | ExtendedMessage;

export interface LLMToolCallResponse {
    verification_required: boolean;
    tool_call: ToolCall;
    message: LLMToolCallMessage[];
    tool_hit: ToolHit;
}

export function isLLMToolCallResponse(response: unknown): response is LLMToolCallResponse {
    if (typeof response !== "object" || response === null) {
        return false;
    }
    const resp = response as Record<string, unknown>;

    if (resp.verification_required !== true) return false;
    if (typeof resp.tool_call !== "object" || resp.tool_call === null) return false;

    const toolCall = resp.tool_call as Record<string, unknown>;
    if (
        typeof toolCall.id !== "string" ||
        typeof toolCall.tool_name !== "string" ||
        typeof toolCall.arguments !== "object"
    ) {
        return false;
    }

    if (!Array.isArray(resp.message)) return false;
    return resp.message.every((msg: unknown) => {
        if (typeof msg !== "object" || msg === null) return false;
        const m = msg as Record<string, unknown>;
        // Check for a simple Message.
        if (typeof m.content === "string" && typeof m.role === "string") {
            return true;
        }
        // Check for an ExtendedMessage.
        if (
            (typeof m.content === "string" || m.content === null) &&
            typeof m.role === "string" &&
            "refusal" in m &&
            "audio" in m &&
            "function_call" in m &&
            "tool_calls" in m
        ) {
            return true;
        }
        return false;
    });
}