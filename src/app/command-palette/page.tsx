"use client"
import { useState } from "react"

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { fetch } from '@tauri-apps/plugin-http'
import { Button } from "@/components/ui/button"

import { isLLMToolCallResponse, LLMToolCallResponse } from "./helpers"

export default function CommandDemo() {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Store toolCall data if we detect one in the server response
  const [toolCallData, setToolCallData] = useState<LLMToolCallResponse | null>(null);
  const [confirmingToolCall, setConfirmingToolCall] = useState<boolean>(false);

  const handleCommand = async (value: string) => {
    if (!value.trim()) return;
    setLoading(true);

    try {
      console.log("Doing request...");
      const result = await fetch(
        "http://localhost:8000/api/users/user_2t7Urf0HmRBLKr25UvXNrbaHhSh/chats/1650b445-9793-4ff9-8825-e807d6a39d52",
        {
          method: "POST",
          body: JSON.stringify({ messages: [{ content: value }] }),
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Fetch done. Status:", result.status, result.statusText);
      const data = await result.json();
      console.log("Response data:", data);

      // Check if the returned data is a tool call
      if (isLLMToolCallResponse(data)) {
        setToolCallData(data);
        setResponse(null); // clear any plain text response
      } else {
        // Otherwise, handle plain text response
        setResponse(data?.choices?.[0]?.message?.content ?? "No response content");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error occurred:", error);
      setResponse("Error processing command");
      setLoading(false);
    }
  };

  const handleToolCallConfirmation = async () => {
    if (!toolCallData) return;
    setConfirmingToolCall(true);

    try {
      const payload = {
        tool_call: toolCallData.tool_call,
        tool_hit: toolCallData.tool_hit,
        updated_arguments: toolCallData.tool_call.arguments,
        messages: toolCallData.message,
      };

      // Example endpoint matching your ChatInterface logic
      const confirmResponse = await fetch(
        "http://localhost:8000/api/users/user_2t7Urf0HmRBLKr25UvXNrbaHhSh/chats/1650b445-9793-4ff9-8825-e807d6a39d52/confirm-tool-call",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!confirmResponse.ok) {
        console.error("Error confirming tool call:", await confirmResponse.text());
      } else {
        const confirmData = await confirmResponse.json();
        console.log("Confirm call response:", confirmData);
        const newContent = confirmData.choices?.[0]?.message?.content;
        setResponse(newContent ?? "No response content after tool call confirmation");
      }
    } catch (error) {
      console.error("Error confirming tool call:", error);
    } finally {
      setConfirmingToolCall(false);
      setToolCallData(null);
    }
  };

  return (
    <div className="bg-transparent w-full">
      <Command shouldFilter={false} className="p-4 py-8 rounded-lg bg-[#151415]">
        <CommandInput
          placeholder=""
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void handleCommand((e.target as HTMLInputElement).value);
            }
          }}
          className="autofocus text-white"
        />
        <CommandList className={"bg-[#151415]"}>
          {/* <CommandEmpty>No results found.</CommandEmpty> */}
          {loading && (
            <CommandGroup heading="Processing">
              <CommandItem>Loading...</CommandItem>
            </CommandGroup>
          )}

          {/* 
            If we have a tool call, show an inline confirmation section. 
            Otherwise, show any plain text response 
          */}
          {toolCallData && (
            <CommandGroup heading="Tool Call Detected" className="bg-[#151415] text-white">
              <CommandItem className="bg-[#151415] text-white flex flex-col gap-2">
                <div>
                  <strong>Tool Name: </strong>
                  {toolCallData.tool_call.tool_name}
                </div>
                <div>
                  <strong>Arguments: </strong>
                  {JSON.stringify(toolCallData.tool_call.arguments, null, 2)}
                </div>
              </CommandItem>
              <CommandItem className="bg-[#151415] text-white flex gap-2">
                <Button
                  onClick={handleToolCallConfirmation}
                  disabled={confirmingToolCall}
                  variant="default"
                >
                  {confirmingToolCall ? "Confirming..." : "Confirm"}
                </Button>
                <Button
                  onClick={() => setToolCallData(null)}
                  variant="outline"
                  disabled={confirmingToolCall}
                >
                  Cancel
                </Button>
              </CommandItem>
            </CommandGroup>
          )}

          {/* Plain text response area */}
          {response && !toolCallData && (
            <CommandGroup heading="Response" className={"bg-[#151415] text-white"}>
              <CommandItem className={"bg-[#151415] text-white"}>
                {response}
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </div>
  )
}
