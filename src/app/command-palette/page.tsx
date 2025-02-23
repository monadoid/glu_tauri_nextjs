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


export default function CommandDemo() {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCommand = async (value: string) => {
    if (!value.trim()) return;

    setLoading(true);
    try {
      console.log("Doing request...")
      const response = await fetch('http://localhost:8000/api/users/user_2t7Urf0HmRBLKr25UvXNrbaHhSh/chats/1650b445-9793-4ff9-8825-e807d6a39d52', {
        method: 'POST',
        body: JSON.stringify({ 
          messages: [{
            content: value
          }] 
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Fetch done. Status:', response.status, response.statusText);

      const data = await response.json();
      console.log(data)
      setResponse(data?.choices?.[0]?.message?.content ?? "No response content");
      setLoading(false)
    } catch (error) {
      console.log("Error occurred:")
      console.log(error)
      setResponse("Error processing command");
      setLoading(false);
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
            {response && (
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
